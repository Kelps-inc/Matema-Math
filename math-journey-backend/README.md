# Matema — Backend (Supabase)

## Setup inicial

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Copie a **Project URL** e a **anon key** (em Project Settings > API)

### 2. Configurar variáveis de ambiente

No arquivo `math-journey-frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Executar migrations

No **SQL Editor** do Supabase, execute na ordem:

1. `supabase/migrations/001_initial_schema.sql` — cria todas as tabelas, RLS, functions e triggers
2. `supabase/seed/001_content.sql` — popula o banco com os módulos, lições e exercícios do MVP

### 4. Configurar autenticação

Em **Authentication > Settings**:
- **Site URL**: `http://localhost:3000` (dev) ou seu domínio de produção
- **Redirect URLs**: adicione `http://localhost:3000/auth/callback` e `https://seu-dominio.com/auth/callback`
- Desabilite "Email confirmations" para simplificar o desenvolvimento

---

## Estrutura do banco de dados

```
user_profiles      — perfil do jogador (level, xp, moedas, streak)
modules            — módulos de conteúdo (Números, Álgebra, etc.)
lessons            — lições dentro de cada módulo
exercises          — exercícios de cada lição (múltipla escolha, V/F, numérico)
user_lesson_progress — quais lições o usuário concluiu
user_exercise_answers — histórico de respostas
```

## RPC Functions

- `award_lesson_completion(user_id, lesson_id, xp, coins)` — atualiza XP/moedas e retorna novo estado
- `xp_to_level(xp_amount)` — converte XP em nível (fórmula: `floor(sqrt(xp/50)) + 1`)
