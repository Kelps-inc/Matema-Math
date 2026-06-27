-- ============================================================
-- MATEMA — Versão Pro (assinatura via AbacatePay)
-- ============================================================
-- Acesso Pro libera o modo Simulado ENEM. Admins têm acesso sempre (bypass).
-- Modelos de cobrança: PIX avulso (30 dias) e assinatura no cartão (recorrente),
-- além de um trial de 7 dias por usuário. A fonte da verdade do acesso é
-- `pro_until` (acesso ativo enquanto pro_until > now()).
--
-- Idempotente: pode ser reaplicada com segurança.
-- ============================================================

alter table public.user_profiles
  add column if not exists pro_until               timestamptz,
  add column if not exists subscription_status     text not null default 'none'
       check (subscription_status in ('none','trial','active','cancelled')),
  add column if not exists trial_started_at        timestamptz,
  add column if not exists abacatepay_customer_id  text,
  add column if not exists abacatepay_subscription_id text;

-- ── Trial de 7 dias (disparado pelo próprio usuário, uma única vez) ──────────
-- SECURITY DEFINER: precisa escrever pro_until/subscription_status, que o
-- cliente não pode setar diretamente. Usa auth.uid() — só ativa para o próprio
-- usuário e só se ele ainda não usou o trial.
create or replace function public.start_pro_trial()
returns json language plpgsql security definer
set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_already timestamptz;
  v_until   timestamptz;
begin
  if v_user_id is null then
    raise exception 'Não autenticado';
  end if;

  select trial_started_at into v_already
    from public.user_profiles where id = v_user_id;

  if v_already is not null then
    return json_build_object('error', 'Trial já utilizado');
  end if;

  v_until := now() + interval '7 days';

  update public.user_profiles
     set trial_started_at    = now(),
         pro_until           = greatest(coalesce(pro_until, now()), v_until),
         subscription_status = case when subscription_status = 'active'
                                    then subscription_status else 'trial' end,
         updated_at          = now()
   where id = v_user_id;

  return json_build_object('pro_until', v_until);
end;
$$;

revoke all on function public.start_pro_trial() from public;
grant execute on function public.start_pro_trial() to authenticated;
