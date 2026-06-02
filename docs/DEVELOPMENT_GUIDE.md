# Development Guide — Matema

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta no [Supabase](https://supabase.com) (free tier funciona)
- Conta no [Vercel](https://vercel.com) (deploy, opcional)

## Setup local

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd "Math Journey/math-journey-frontend"
npm install
```

### 2. Crie o projeto Supabase

1. Acesse [supabase.com](https://supabase.com) → New Project
2. Anote a **URL do projeto** e a **anon key** (Settings → API)

### 3. Aplique o schema e seed

No **SQL Editor** do dashboard Supabase:

```sql
-- 1. Schema completo
-- Cole e execute: math-journey-backend/supabase/migrations/001_initial_schema.sql

-- 2. Conteúdo inicial
-- Cole e execute: math-journey-backend/supabase/seed/001_content.sql
```

### 4. Configure autenticação Supabase

Em **Authentication → Settings**:
- Site URL: `http://localhost:3000`
- Redirect URLs: adicione `http://localhost:3000/auth/callback`
- Email confirmations: desabilite para desenvolvimento

### 5. Crie o arquivo `.env.local`

```bash
cd math-journey-frontend
cp .env.example .env.local   # se existir
# ou crie manualmente:
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Nunca commite `.env.local`.** Já está no `.gitignore`.

### 6. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Estrutura de pastas que você vai tocar

```
math-journey-frontend/src/
├── app/actions/          # Server Actions (backend)
├── app/[rota]/page.tsx   # Páginas RSC
├── application/          # Use Cases
├── domain/               # Entidades e interfaces
├── infrastructure/       # Repositórios Supabase
└── presentation/         # Componentes React
```

## Fluxo de trabalho para novas features

### Adicionando um exercício/conteúdo

1. Edite `math-journey-backend/supabase/seed/001_content.sql`
2. Execute no SQL Editor do Supabase

### Adicionando um campo ao perfil do usuário

1. Escreva migration SQL:
   ```sql
   ALTER TABLE user_profiles ADD COLUMN novo_campo tipo DEFAULT valor;
   ```
2. Execute no SQL Editor
3. Atualize `src/domain/user/entities/User.ts`
4. Atualize `src/infrastructure/repositories/SupabaseUserRepository.ts`
5. Atualize Server Action relevante se necessário

### Adicionando uma nova página

1. Crie `src/app/nova-rota/page.tsx`
2. Se precisar de autenticação:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/entrar')
   ```
3. Busque dados via repositório
4. Passe como props para Client Components

### Adicionando uma Server Action

1. Crie ou edite arquivo em `src/app/actions/`
2. Use o padrão:
   ```typescript
   'use server'
   import { z } from 'zod'
   
   const schema = z.object({ ... })
   
   export async function minhaAction(payload: unknown) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'Não autenticado' }
     
     const parsed = schema.safeParse(payload)
     if (!parsed.success) return { error: 'Dados inválidos' }
     
     // lógica...
     
     revalidatePath('/rota-relevante')
     return { success: true }
   }
   ```

## Comandos úteis

```bash
npm run dev      # Dev server com Turbopack
npm run build    # Build de produção (verifica erros TS)
npm run lint     # ESLint
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave pública anon |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Chave admin (operações admin) |

## Deploy (Vercel)

1. Conecte o repositório no [vercel.com](https://vercel.com)
2. Root directory: `math-journey-frontend`
3. Adicione as variáveis de ambiente no painel Vercel
4. Adicione URL de produção no Supabase Auth → Redirect URLs

## Testando localmente

Não há suite de testes automatizados atualmente. Teste manualmente:

1. Crie conta em `/cadastro`
2. Complete uma lição em `/modulos`
3. Acesse `/ranqueada/placement` para ELO inicial
4. Jogue uma partida em `/ranqueada/jogar/ranked`
5. Compre um item em `/loja`
6. Customize avatar em `/avatar`

## Troubleshooting

| Problema | Solução |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` undefined | Verifique `.env.local`, reinicie `npm run dev` |
| RLS negando acesso | Verifique se usuário está autenticado; confira policies no Supabase |
| `award_lesson_completion` RPC error | Verifique se a function foi criada (schema SQL) |
| Build falha com erros de tipo | `npm run build` antes de fazer PR |
| Avatar não renderiza | Verifique console — pode ser SVG inválido por config fora do range |
