-- ============================================================
-- MATEMA — Chat (DM entre amigos) + presença
-- ============================================================
-- DM 1-a-1 apenas entre amigos (friendship 'accepted'). Leve: o cliente faz
-- polling (sem Realtime). O histórico "expira" em 7 dias: as leituras filtram
-- por created_at > now()-7d (garantia de UX) e um purge diário apaga o que passa
-- disso (best-effort via pg_cron; se indisponível, a filtragem na leitura basta).
--
-- Presença: reaproveita user_profiles.last_active_at (online = ativo nos últimos
-- minutos), atualizado por um heartbeat. Não precisa de coluna nova.
--
-- Idempotente: pode ser reaplicada com segurança.
-- ============================================================

create table if not exists public.chat_messages (
  id           uuid        primary key default gen_random_uuid(),
  sender_id    uuid        not null references auth.users(id) on delete cascade,
  recipient_id uuid        not null references auth.users(id) on delete cascade,
  content      text        not null check (char_length(content) between 1 and 1000),
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

-- Conversa entre um par (ordenada por tempo) e contagem de não-lidas.
create index if not exists chat_messages_pair_idx
  on public.chat_messages (sender_id, recipient_id, created_at desc);
create index if not exists chat_messages_recipient_unread_idx
  on public.chat_messages (recipient_id, read_at);

alter table public.chat_messages enable row level security;

-- Vejo as mensagens em que sou remetente ou destinatário.
drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select" on public.chat_messages
  for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Envio só como eu mesmo e só para quem é meu amigo (friendship accepted).
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.friendships f
       where f.status = 'accepted'
         and (
           (f.requester_id = auth.uid() and f.addressee_id = chat_messages.recipient_id)
           or
           (f.addressee_id = auth.uid() and f.requester_id = chat_messages.recipient_id)
         )
    )
  );

-- O destinatário pode marcar como lida (read_at).
drop policy if exists "chat_messages_update_read" on public.chat_messages;
create policy "chat_messages_update_read" on public.chat_messages
  for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- ── Purge de mensagens com mais de 7 dias ───────────────────────────────────
create or replace function public.purge_old_chat_messages()
returns void language sql security definer set search_path = public as $$
  delete from public.chat_messages where created_at < now() - interval '7 days';
$$;

revoke all on function public.purge_old_chat_messages() from public, anon, authenticated;
grant execute on function public.purge_old_chat_messages() to service_role;

-- Agendamento diário (best-effort). Se pg_cron não estiver disponível, a
-- filtragem por 7 dias na leitura já garante a expiração visível ao usuário.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    begin
      create extension if not exists pg_cron;
    exception when others then
      raise notice 'pg_cron indisponível; purge automático não agendado.';
      return;
    end;
  end if;
  perform cron.schedule('purge-old-chat-messages', '0 4 * * *',
                        'select public.purge_old_chat_messages()');
exception when others then
  raise notice 'Não foi possível agendar o purge via pg_cron: %', sqlerrm;
end $$;
