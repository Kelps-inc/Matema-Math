# Database — Matema

> **Manutenção:** Toda alteração em tabelas, colunas, enums, functions, triggers ou RLS **deve** ser refletida aqui imediatamente. Consulte `docs/MAINTENANCE.md`.

Banco de dados: **PostgreSQL** via **Supabase**.  
Schema principal: `public`. Auth: `auth` (gerenciado pelo Supabase).

## Tabelas

### `user_profiles`
Perfil do jogador (1:1 com `auth.users`).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | FK → auth.users.id |
| username | text unique | Login único lowercase |
| display_name | text | Nome exibido |
| avatar_id | text | 'default' ou referência |
| level | int ≥1 | Nível calculado |
| xp | int ≥0 | XP acumulado |
| coins | int ≥0 | Moedas |
| streak_days | int | Dias consecutivos |
| is_admin | bool | Acesso admin |
| elo_tier | elo_tier_enum | bronze/prata/ouro/platina/diamante/mestre |
| elo_division | int 1-4 | Divisão dentro do tier |
| elo_lp | int | League Points 0–99 |
| placement_completed | bool | Passou pelo placement? |
| placement_completed_at | timestamptz | Quando completou |
| last_active_at | timestamptz | Última atividade |
| created_at | timestamptz | Criação |
| updated_at | timestamptz | Atualização |

### `modules`
Módulos de conteúdo matemático.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| slug | text unique | ex: 'numeros-e-operacoes' |
| title | text | Nome exibido |
| description | text | Descrição curta |
| icon | text | Emoji, ex: '🔢' |
| color | text | Hex, ex: '#D4845A' |
| order_index | int | Ordem de exibição |
| is_free | bool | Acesso sem assinatura |
| created_at | timestamptz | |

### `lessons`
Lições dentro de módulos.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| module_id | uuid FK | → modules.id |
| slug | text | Único por módulo |
| title | text | |
| description | text | |
| theory | text | Texto de teoria (pré-exercício) |
| order_index | int | |
| xp_reward | int >0 | XP ao completar |
| coin_reward | int >0 | Moedas ao completar |
| created_at | timestamptz | |

**Constraint**: `unique(module_id, slug)`

### `exercises`
Questões de uma lição.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| lesson_id | uuid FK | → lessons.id |
| question | text | Pode conter LaTeX ($...$) |
| context | text nullable | Enunciado longo |
| type | exercise_type_enum | multiple_choice, true_false, numeric |
| options | jsonb | Array de strings (para MC) |
| correct_answer | text | |
| explanation | text | Exibido após responder |
| difficulty | difficulty_enum | easy, medium, hard |
| order_index | int | |
| source | text nullable | 'ENEM AAAA' ou 'Original Matema' |
| created_at | timestamptz | |

### `user_lesson_progress`
Registro de lições completadas.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | → auth.users.id |
| lesson_id | uuid FK | → lessons.id |
| completed_at | timestamptz | |
| xp_earned | int | |
| coins_earned | int | |
| attempts | int default 1 | |

**Constraint**: `unique(user_id, lesson_id)`

### `user_exercise_answers`
Histórico de respostas.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| exercise_id | uuid FK | |
| answer | text | Resposta dada |
| is_correct | bool | |
| time_ms | int nullable | Tempo em milissegundos |
| is_ranked | bool default false | Resposta em modo ranqueado |
| is_skipped | bool default false | Pulou a questão |
| answered_at | timestamptz | |

### `user_avatar_config`
Configuração do avatar do jogador.

| Coluna | Tipo | Descrição |
|---|---|---|
| user_id | uuid PK FK | |
| skin_tone | text | ex: '#F5D5B0' |
| eye_color | text | |
| eye_style | text | 'normal', 'almond', etc. |
| nose_style | text | |
| brow_style | text | |
| mouth_style | text | |
| body_type | text | 'slim', 'average', 'fit', 'chubby' |
| height | text | 'short', 'average', 'tall' |
| hair_style | text | curto, médio, longo, cacheado, etc. |
| hair_color | text | |
| gender | text | 'masculine', 'feminine' |
| updated_at | timestamptz | |

### `shop_items`
Itens disponíveis na loja.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| name | text | Nome do item |
| category | text | ex: 'acessorio' |
| price | int | Em moedas |
| created_at | timestamptz | |

### `user_inventory`
Itens possuídos pelo jogador.

| Coluna | Tipo | Descrição |
|---|---|---|
| user_id | uuid FK | |
| item_id | uuid FK | → shop_items.id |
| is_equipped | bool | |

**PK**: `(user_id, item_id)`

### `placement_questions`
Questões do placement test (ELO inicial).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| question | text | Pode conter LaTeX |
| options | jsonb | Array de strings |
| correct_answer | text | |
| difficulty | difficulty_enum | |
| order_index | int | |

## Enums

```sql
CREATE TYPE elo_tier_enum AS ENUM (
  'bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre'
);

CREATE TYPE exercise_type_enum AS ENUM (
  'multiple_choice', 'true_false', 'numeric'
);

CREATE TYPE difficulty_enum AS ENUM (
  'easy', 'medium', 'hard'
);
```

## Functions SQL

### `xp_to_level(xp integer) → integer`
```sql
RETURNS Math.floor(sqrt(xp / 50.0)) + 1
```

### `award_lesson_completion(p_user_id, p_lesson_id, p_xp, p_coins) → json`
Operação atômica:
1. Insere em `user_lesson_progress` (ON CONFLICT DO NOTHING)
2. Se inseriu (primeiro completação): incrementa XP e moedas no perfil
3. Retorna `{ success: bool, already_completed: bool }`

### `purchase_item(p_user_id, p_item_id) → json`
Operação atômica:
1. Verifica saldo de moedas
2. Debita moedas
3. Insere em `user_inventory`
4. Retorna `{ success: bool, error?: string }`

### `handle_new_user() → trigger`
Dispara após INSERT em `auth.users`:
- Cria linha em `user_profiles` com defaults
- Cria linha em `user_avatar_config` com defaults

## RLS (Row Level Security)

Todas as tabelas têm RLS habilitado.

| Tabela | Política |
|---|---|
| user_profiles | SELECT/UPDATE apenas próprio (id = auth.uid()) |
| modules, lessons, exercises | SELECT público; INSERT/UPDATE apenas admin |
| user_lesson_progress | SELECT/INSERT/UPDATE apenas próprio |
| user_exercise_answers | SELECT/INSERT apenas próprio |
| user_avatar_config | SELECT/UPDATE apenas próprio |
| user_inventory | SELECT/INSERT/UPDATE apenas próprio |
| shop_items | SELECT público; INSERT/UPDATE apenas admin |
| placement_questions | SELECT público |

## Arquivos de migração

```
math-journey-backend/supabase/migrations/
  001_initial_schema.sql    # Schema completo, enums, RLS, triggers, functions

math-journey-backend/supabase/seed/
  001_content.sql           # 4 módulos, lições e exercícios iniciais
```

## Como aplicar o schema

```bash
# No Supabase SQL Editor (dashboard)
# 1. Cole e execute 001_initial_schema.sql
# 2. Cole e execute 001_content.sql (seed)
```
