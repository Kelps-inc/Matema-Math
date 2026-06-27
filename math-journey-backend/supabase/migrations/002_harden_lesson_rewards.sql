-- ============================================================
-- MATEMA — Endurecimento anti-cheat de award_lesson_completion
-- ============================================================
-- Contexto: a versão original de `award_lesson_completion` recebia p_xp/p_coins
-- do chamador e creditava XP/moedas a CADA chamada, permitindo:
--   (a) forjar a recompensa (qualquer valor de XP/moedas), e
--   (b) refarmar XP refazendo a mesma lição indefinidamente.
--
-- Esta migration:
--   1. Move o lookup da recompensa para DENTRO do RPC (lê lessons.xp_reward /
--      lessons.coin_reward). A assinatura passa a receber só (p_user_id, p_lesson_id).
--   2. Zera a recompensa quando a lição já está em user_lesson_progress (anti-refarm).
--   3. Registra/atualiza user_lesson_progress de forma idempotente dentro do RPC,
--      tornando a operação atômica (antes o insert era feito em separado no repo).
--
-- Idempotente: pode ser reaplicada com segurança.
-- ============================================================

-- Remove a assinatura antiga (que aceitava p_xp/p_coins do cliente).
drop function if exists public.award_lesson_completion(uuid, uuid, integer, integer);

create or replace function public.award_lesson_completion(
  p_user_id uuid,
  p_lesson_id uuid
)
returns json language plpgsql security definer as $$
declare
  v_xp_reward     integer;
  v_coin_reward   integer;
  v_already       boolean;
  v_awarded_xp    integer := 0;
  v_awarded_coins integer := 0;
  v_new_xp        integer;
  v_new_level     integer;
  v_new_coins     integer;
begin
  -- Recompensa SEMPRE derivada da tabela lessons, nunca do chamador.
  select xp_reward, coin_reward
    into v_xp_reward, v_coin_reward
    from public.lessons
   where id = p_lesson_id;

  if v_xp_reward is null then
    raise exception 'Lesson not found: %', p_lesson_id;
  end if;

  -- Lição já concluída? Então não credita nada (anti-refarm).
  select exists(
    select 1 from public.user_lesson_progress
     where user_id = p_user_id and lesson_id = p_lesson_id
  ) into v_already;

  if not v_already then
    v_awarded_xp    := v_xp_reward;
    v_awarded_coins := v_coin_reward;
  end if;

  update public.user_profiles
     set xp             = xp + v_awarded_xp,
         coins          = coins + v_awarded_coins,
         level          = public.xp_to_level(xp + v_awarded_xp),
         last_active_at = now(),
         updated_at     = now()
   where id = p_user_id
  returning xp, level, coins
      into v_new_xp, v_new_level, v_new_coins;

  if v_new_xp is null then
    raise exception 'User profile not found: %', p_user_id;
  end if;

  -- Registra a conclusão de forma idempotente (atômica com o crédito acima).
  insert into public.user_lesson_progress
    (user_id, lesson_id, xp_earned, coins_earned, completed_at, attempts)
  values
    (p_user_id, p_lesson_id, v_awarded_xp, v_awarded_coins, now(), 1)
  on conflict (user_id, lesson_id) do update
     set attempts = public.user_lesson_progress.attempts + 1;

  return json_build_object(
    'xp',                v_new_xp,
    'level',             v_new_level,
    'coins',             v_new_coins,
    'awarded_xp',        v_awarded_xp,
    'awarded_coins',     v_awarded_coins,
    'already_completed', v_already
  );
end;
$$;
