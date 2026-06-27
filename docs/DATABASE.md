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
| duel_rating | int (default 1000) | Rating de Duelo (separado do ELO) — migration `004` |
| duel_wins | int (default 0) | Vitórias em Duelo |
| duel_losses | int (default 0) | Derrotas em Duelo |
| pro_until | timestamptz | Acesso Pro ativo enquanto `> now()` — migration `005` |
| subscription_status | text | `none`/`trial`/`active`/`cancelled` |
| trial_started_at | timestamptz | Quando ativou o trial de 7 dias (impede repetir) |
| abacatepay_customer_id | text | Id do cliente no AbacatePay (`cust_...`) |
| abacatepay_subscription_id | text | Id da assinatura/cobrança (`bill_...`) |
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

### `simulado_sessions`
Sessão salva/retomável do Simulado ENEM (1 linha por usuário — `UNIQUE (user_id)`). Migration `003`.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | Dono da sessão |
| exercise_ids | uuid[] | Ordem fixa das 45 questões |
| answers | jsonb (default `{}`) | Mapa `{ exerciseId: answer }` |
| time_remaining_ms | int (default 9 900 000) | Tempo restante (~2h45) |
| started_at | timestamptz | Início |
| updated_at | timestamptz | Último autosave |

### `duels`
Duelos 1v1 **assíncronos** (estilo Perguntados). Migration `004`.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| challenger_id | uuid FK → auth.users | Quem desafiou |
| opponent_id | uuid FK → auth.users (nullable) | Oponente (null enquanto `pending`) |
| status | text | `pending` / `active` / `completed` / `cancelled` |
| invite_code | text unique (nullable) | Código de convite |
| question_ids | uuid[] | Questões da partida |
| challenger_answers / opponent_answers | jsonb | Respostas de cada lado |
| challenger_correct / opponent_correct | int | Acertos |
| challenger_time_ms / opponent_time_ms | int | Tempo total |
| challenger_played_at / opponent_played_at | timestamptz | Quando jogou |
| winner_id | uuid FK → auth.users (nullable) | Vencedor |
| challenger_rating_change / opponent_rating_change | int | Δ de `duel_rating` |
| created_at | timestamptz | |
| expires_at | timestamptz (default +7 dias) | Expiração do convite |
| completed_at | timestamptz | Conclusão |

Índices: `(challenger_id, status)`, `(opponent_id, status)`.

### `friendships`
Amizades / pedidos de amizade. Migration `004`.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| requester_id | uuid FK → auth.users | Quem pediu |
| addressee_id | uuid FK → auth.users | Quem recebeu |
| status | text | `pending` / `accepted` / `blocked` |
| created_at / updated_at | timestamptz | |

Constraints: `UNIQUE (requester_id, addressee_id)`, `CHECK (requester_id != addressee_id)`. Índice: `(addressee_id, status)`.

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

### `award_lesson_completion(p_user_id, p_lesson_id) → json`
Operação atômica (endurecida na migration `002_harden_lesson_rewards.sql` — a assinatura
antiga `(p_user_id, p_lesson_id, p_xp, p_coins)` foi removida; **não** confie em recompensa
vinda do chamador):
1. Lê `xp_reward`/`coin_reward` de `lessons` (recompensa derivada do banco, nunca do cliente).
2. Se a lição já existe em `user_lesson_progress`, **zera** a recompensa (anti-refarm).
3. Incrementa XP/moedas e recalcula `level` via `xp_to_level` no perfil.
4. Faz upsert em `user_lesson_progress` (`ON CONFLICT (user_id, lesson_id)` → incrementa `attempts`).
5. Retorna `{ xp, level, coins, awarded_xp, awarded_coins, already_completed }`.

### `purchase_item(p_user_id, p_item_id) → json`
Operação atômica:
1. Verifica saldo de moedas
2. Debita moedas
3. Insere em `user_inventory`
4. Retorna `{ success: bool, error?: string }`

### `apply_duel_ratings(...) → json`
RPC `SECURITY DEFINER` que credita o resultado de um Duelo de forma atômica: ajusta
`duel_rating`/`duel_wins`/`duel_losses` dos dois participantes e grava `winner_id` +
`*_rating_change` na linha de `duels`. Chamado em `app/actions/duelo.ts` (`submitDuelAnswersAction`).

> ⚠️ **Lacuna de reprodutibilidade conhecida:** `apply_duel_ratings` existe no banco remoto
> mas **não** está capturada em nenhuma migration numerada do repo (entrou via migration com
> timestamp aplicada direto no remoto, depois consolidada). Ver ADR-011 em `DECISIONS.md`.
> Ao mexer nesse RPC, materialize-o numa migration `005_*` ou rode `supabase db pull`.

### `start_pro_trial() → json`
RPC `SECURITY DEFINER` (migration `005`) que ativa o **trial de 7 dias** do Pro para o
usuário autenticado (`auth.uid()`), uma única vez (`trial_started_at`). Seta `pro_until`
e `subscription_status='trial'`. `grant execute` só para `authenticated`. O acesso pago é
liberado pelo **webhook** (`/api/abacatepay/webhook`) via service role, não por RPC.

> ⚠️ A política RLS de `user_profiles` permite o usuário dar `UPDATE` no próprio registro
> (qualquer coluna). Por isso campos sensíveis (`pro_until`, `xp`, `elo_*`) **devem** ser
> escritos só por RPC `security definer` ou pelo webhook (service role) — nunca confie em
> update direto do cliente. Endurecer essa policy (column-level / WITH CHECK) é um TODO.

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
| simulado_sessions | ALL apenas próprio (user_id = auth.uid()) |
| duels | SELECT: participantes ou duelos `pending` sem oponente; INSERT: só o desafiante; UPDATE: participantes |
| friendships | ALL: requester ou addressee (WITH CHECK: requester) |

## Arquivos de migração

```
math-journey-backend/supabase/migrations/
  001_initial_schema.sql        # Schema base, enums, RLS, triggers, functions
  002_harden_lesson_rewards.sql # Anti-cheat: RPC award_lesson_completion (2 args)
  003_simulado_sessions.sql     # Tabela simulado_sessions + RLS
  004_duels_and_friendships.sql # Tabelas duels/friendships + colunas de duelo
  005_pro_subscription.sql      # Versão Pro: colunas de assinatura + RPC start_pro_trial

math-journey-backend/supabase/seed/
  001_content.sql               # 4 módulos, lições e exercícios iniciais
```

> ⚠️ O RPC `apply_duel_ratings` (Duelos) ainda **não** está numa migration numerada — ver
> nota na seção de Functions SQL e ADR-011. O projeto está vinculado via Supabase CLI
> (`supabase link`); o histórico local/remoto foi reconciliado (ver ADR-011).

## Como aplicar o schema

```bash
# Opção A — Supabase CLI (projeto já vinculado via `supabase link`)
cd math-journey-backend
supabase db push            # aplica migrations pendentes ao remoto
supabase migration list     # confere alinhamento local ↔ remoto

# Opção B — Supabase SQL Editor (dashboard): cole e execute as migrations em ordem,
# depois o seed 001_content.sql.
```
