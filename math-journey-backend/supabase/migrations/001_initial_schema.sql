-- ============================================================
-- MATEMA — Schema inicial
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS DE USUÁRIO
-- ============================================================

create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  display_name text not null,
  avatar_id   text not null default 'default',
  level       integer not null default 1,
  xp          integer not null default 0,
  coins       integer not null default 0,
  streak_days integer not null default 0,
  last_active_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint xp_non_negative check (xp >= 0),
  constraint coins_non_negative check (coins >= 0),
  constraint level_positive check (level >= 1)
);

-- ============================================================
-- TABELAS DE CONTEÚDO
-- ============================================================

create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  description text not null,
  icon        text not null,
  color       text not null default '#D4845A',
  order_index integer not null,
  is_free     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.lessons (
  id          uuid primary key default uuid_generate_v4(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  slug        text not null,
  title       text not null,
  description text not null,
  order_index integer not null,
  xp_reward   integer not null default 20,
  coin_reward integer not null default 5,
  created_at  timestamptz not null default now(),
  unique(module_id, slug),
  constraint xp_reward_positive check (xp_reward > 0),
  constraint coin_reward_positive check (coin_reward > 0)
);

create type exercise_type as enum ('multiple_choice', 'true_false', 'numeric');
create type difficulty_level as enum ('easy', 'medium', 'hard');

create table if not exists public.exercises (
  id            uuid primary key default uuid_generate_v4(),
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  question      text not null,
  context       text,
  type          exercise_type not null default 'multiple_choice',
  options       jsonb,
  correct_answer text not null,
  explanation   text not null,
  difficulty    difficulty_level not null default 'easy',
  order_index   integer not null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TABELAS DE PROGRESSO
-- ============================================================

create table if not exists public.user_lesson_progress (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  xp_earned     integer not null,
  coins_earned  integer not null,
  attempts      integer not null default 1,
  unique(user_id, lesson_id)
);

create table if not exists public.user_exercise_answers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  answer        text not null,
  is_correct    boolean not null,
  answered_at   timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.user_exercise_answers enable row level security;

-- user_profiles: só pode ver e editar o próprio perfil
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- modules, lessons, exercises: leitura pública
create policy "Anyone can view modules"
  on public.modules for select using (true);

create policy "Anyone can view lessons"
  on public.lessons for select using (true);

create policy "Anyone can view exercises"
  on public.exercises for select using (true);

-- progresso: só o próprio usuário
create policy "Users can view own progress"
  on public.user_lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can view own answers"
  on public.user_exercise_answers for select
  using (auth.uid() = user_id);

create policy "Users can insert own answers"
  on public.user_exercise_answers for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- FUNÇÃO: criar perfil automaticamente após signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- FUNÇÃO: calcular nível a partir do XP
-- Fórmula: level = floor(sqrt(xp / 50)) + 1
-- Nível 1 = 0 XP, Nível 2 = 50 XP, Nível 3 = 200 XP, etc.
-- ============================================================

create or replace function public.xp_to_level(xp_amount integer)
returns integer language plpgsql as $$
begin
  return floor(sqrt(xp_amount::float / 50.0))::integer + 1;
end;
$$;

-- ============================================================
-- FUNÇÃO: atualizar XP e moedas do usuário
-- ============================================================

create or replace function public.award_lesson_completion(
  p_user_id uuid,
  p_lesson_id uuid,
  p_xp integer,
  p_coins integer
)
returns json language plpgsql security definer as $$
declare
  v_new_xp    integer;
  v_new_level integer;
  v_new_coins integer;
begin
  update public.user_profiles
  set
    xp          = xp + p_xp,
    coins       = coins + p_coins,
    level       = public.xp_to_level(xp + p_xp),
    last_active_at = now(),
    updated_at  = now()
  where id = p_user_id
  returning xp, level, coins
  into v_new_xp, v_new_level, v_new_coins;

  return json_build_object(
    'xp', v_new_xp,
    'level', v_new_level,
    'coins', v_new_coins
  );
end;
$$;
