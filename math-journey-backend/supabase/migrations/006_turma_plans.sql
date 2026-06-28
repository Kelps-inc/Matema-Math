-- ============================================================
-- MATEMA — Plano Turma / Sala de Aula (PIX avulso via AbacatePay)
-- ============================================================
-- Um responsável (prof, diretor) compra N vagas Pro por M meses num único PIX
-- com valor customizado (14,90 × N × fator × M). Ao confirmar o pagamento,
-- geramos N códigos únicos; cada aluno resgata o seu e ganha Pro por M meses.
--
-- Preço (espelha domain/pro/turmaPricing.ts — manter sincronizado):
--   unidade  = 1490 centavos (R$ 14,90/mês)
--   fator    = 0.80 (20% off) se N ≤ 49 ; 0.75 (25% off) se N ≥ 50
--   total    = round(1490 × N × fator × M)
--
-- A fonte da verdade do acesso continua sendo user_profiles.pro_until
-- (acesso ativo enquanto pro_until > now()). Ver migration 005.
--
-- Idempotente: pode ser reaplicada com segurança.
-- ============================================================

-- ── Pedido da turma (1 linha por compra) ────────────────────────────────────
create table if not exists public.turma_orders (
  id                     uuid        primary key default gen_random_uuid(),
  owner_id               uuid        not null references auth.users(id) on delete cascade,
  seats                  int         not null check (seats between 2 and 2000),
  months                 int         not null check (months in (1, 3, 6, 12)),
  unit_price_cents       int         not null,          -- preço por aluno/mês (1490)
  discount_pct           int         not null,          -- 20 ou 25
  total_cents            int         not null check (total_cents > 0),
  status                 text        not null default 'pending'
                                     check (status in ('pending','paid','expired','cancelled')),
  abacatepay_billing_id  text,                           -- id da cobrança PIX (pix_char_... / bill_...)
  paid_at                timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists turma_orders_owner_idx on public.turma_orders (owner_id);

-- ── Códigos da turma (N linhas por pedido pago) ─────────────────────────────
create table if not exists public.turma_codes (
  id           uuid        primary key default gen_random_uuid(),
  order_id     uuid        not null references public.turma_orders(id) on delete cascade,
  code         text        not null unique,
  redeemed_by  uuid        references auth.users(id) on delete set null,
  redeemed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists turma_codes_order_idx     on public.turma_codes (order_id);
create index if not exists turma_codes_redeemed_idx  on public.turma_codes (redeemed_by);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.turma_orders enable row level security;
alter table public.turma_codes  enable row level security;

-- O dono enxerga e cria seus próprios pedidos. Updates de status são feitos
-- só via webhook (service_role, bypassa RLS) — sem policy de update p/ usuário.
drop policy if exists "turma_orders_owner_select" on public.turma_orders;
create policy "turma_orders_owner_select" on public.turma_orders
  for select to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "turma_orders_owner_insert" on public.turma_orders;
create policy "turma_orders_owner_insert" on public.turma_orders
  for insert to authenticated
  with check (auth.uid() = owner_id);

-- O dono do pedido vê todos os códigos (para distribuir); o aluno vê o código
-- que resgatou. Inserção/resgate só via RPC SECURITY DEFINER abaixo.
drop policy if exists "turma_codes_visible" on public.turma_codes;
create policy "turma_codes_visible" on public.turma_codes
  for select to authenticated
  using (
    redeemed_by = auth.uid()
    or exists (
      select 1 from public.turma_orders o
       where o.id = turma_codes.order_id and o.owner_id = auth.uid()
    )
  );

-- ── Confirmação de pagamento (chamada pelo webhook, idempotente) ────────────
-- SECURITY DEFINER: marca o pedido como pago e gera N códigos únicos.
-- Idempotente: se já estiver pago, não gera de novo (webhooks reenviam).
create or replace function public.fulfill_turma_order(
  p_order_id   uuid,
  p_billing_id text default null
)
returns json language plpgsql security definer
set search_path = public as $$
declare
  v_order public.turma_orders;
  v_code  text;
  i       int;
begin
  select * into v_order from public.turma_orders where id = p_order_id for update;
  if not found then
    return json_build_object('error', 'order_not_found');
  end if;

  if v_order.status = 'paid' then
    return json_build_object('ok', true, 'already', true, 'seats', v_order.seats);
  end if;

  update public.turma_orders
     set status                = 'paid',
         paid_at               = now(),
         abacatepay_billing_id = coalesce(p_billing_id, abacatepay_billing_id),
         updated_at            = now()
   where id = p_order_id;

  for i in 1..v_order.seats loop
    loop
      -- Código curto e legível: TRM-XXXXXXXX (hex maiúsculo).
      v_code := 'TRM-' || upper(substr(md5(random()::text || clock_timestamp()::text || i::text), 1, 8));
      begin
        insert into public.turma_codes(order_id, code) values (p_order_id, v_code);
        exit;
      exception when unique_violation then
        -- colisão rara: tenta outro
      end;
    end loop;
  end loop;

  return json_build_object('ok', true, 'seats', v_order.seats);
end;
$$;

-- Só o service_role (webhook) pode confirmar pagamento e gerar códigos.
-- Revogar de anon/authenticated é CRÍTICO: senão qualquer um marcaria um
-- pedido como pago (sem pagar) via /rest/v1/rpc/fulfill_turma_order.
revoke all on function public.fulfill_turma_order(uuid, text) from public, anon, authenticated;
grant execute on function public.fulfill_turma_order(uuid, text) to service_role;

-- ── Resgate de código pelo aluno ────────────────────────────────────────────
-- SECURITY DEFINER: precisa escrever pro_until/subscription_status e marcar o
-- código. Usa auth.uid() — só libera Pro para quem está resgatando.
create or replace function public.redeem_turma_code(p_code text)
returns json language plpgsql security definer
set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_code  public.turma_codes;
  v_order public.turma_orders;
  v_until timestamptz;
begin
  if v_uid is null then
    raise exception 'Não autenticado';
  end if;

  select * into v_code from public.turma_codes
   where code = upper(trim(p_code)) for update;
  if not found then
    return json_build_object('error', 'Código inválido');
  end if;

  if v_code.redeemed_by is not null then
    return json_build_object('error',
      case when v_code.redeemed_by = v_uid then 'Você já resgatou este código'
           else 'Código já utilizado' end);
  end if;

  select * into v_order from public.turma_orders where id = v_code.order_id;
  if v_order.status <> 'paid' then
    return json_build_object('error', 'Turma ainda não confirmada');
  end if;

  -- Um aluno não pode ocupar duas vagas da mesma turma.
  if exists (
    select 1 from public.turma_codes
     where order_id = v_order.id and redeemed_by = v_uid
  ) then
    return json_build_object('error', 'Você já faz parte desta turma');
  end if;

  v_until := now() + make_interval(months => v_order.months);

  update public.turma_codes
     set redeemed_by = v_uid, redeemed_at = now()
   where id = v_code.id;

  update public.user_profiles
     set pro_until           = greatest(coalesce(pro_until, now()), v_until),
         subscription_status = case when subscription_status = 'trial'
                                    then 'active' else
                                    case when subscription_status = 'none'
                                         then 'active' else subscription_status end end,
         updated_at          = now()
   where id = v_uid;

  return json_build_object('pro_until', v_until, 'months', v_order.months);
end;
$$;

revoke all on function public.redeem_turma_code(text) from public, anon;
grant execute on function public.redeem_turma_code(text) to authenticated;
