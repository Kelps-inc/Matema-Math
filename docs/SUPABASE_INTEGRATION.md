# Supabase Integration — Matema

> Este documento detalha os padrões de integração com o Supabase em todas as camadas da aplicação.

## Configuração do projeto

**Dashboard Supabase**: https://supabase.com/dashboard  
**Localização do config**: `math-journey-frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Clientes Supabase

### Server Client (`src/infrastructure/supabase/server.ts`)

Usado em Server Components e Server Actions. Lê/escreve cookies para gerenciar sessão.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => { /* set cookies */ }
      }
    }
  )
}
```

### Browser Client (`src/infrastructure/supabase/client.ts`)

Usado apenas quando necessário em Client Components (ex: Realtime futuro).

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## Auth Integration

### Signup
```typescript
// src/app/actions/auth.ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username, display_name }
  }
})
```

O trigger `handle_new_user()` cria automaticamente:
- `user_profiles` com defaults
- `user_avatar_config` com defaults

### Login
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password })
```

### Logout
```typescript
await supabase.auth.signOut()
redirect('/entrar')
```

### Verificar usuário autenticado
```typescript
// SEMPRE use getUser(), não getSession()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/entrar')  // em RSC
if (!user) return { error: 'Não autenticado' }  // em Server Action
```

## Row Level Security

Toda query ao Supabase passa pelo RLS automaticamente. O `anon key` respeita as policies.

**Exemplo de policy:**
```sql
-- users só veem seu próprio perfil
CREATE POLICY "Users view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);
```

Ao usar o client com a sessão do usuário autenticado, `auth.uid()` retorna o UUID do usuário logado.

## Funções RPC

### `award_lesson_completion`
```typescript
// Recompensa derivada de `lessons` DENTRO do RPC — NÃO passe p_xp/p_coins (anti-cheat).
const { data, error } = await supabase.rpc('award_lesson_completion', {
  p_user_id: userId,
  p_lesson_id: lessonId
})
// data: { xp, level, coins, awarded_xp, awarded_coins, already_completed }
// Recompletar uma lição já concluída credita 0 (anti-refarm).
```

### `purchase_item`
```typescript
const { data, error } = await supabase.rpc('purchase_item', {
  p_user_id: userId,
  p_item_id: itemId
})
// data: { success: boolean, error?: string }
```

## Realtime (futuro)

Atualmente não usado. Para duelos 1v1 ou leaderboard em tempo real:

```typescript
const channel = supabase
  .channel('game-room')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_moves' }, 
      (payload) => handleMove(payload.new))
  .subscribe()
```

## Auth Callback Route

`src/app/auth/callback/route.ts` — troca o code OAuth por sessão:

```typescript
const { searchParams } = new URL(request.url)
const code = searchParams.get('code')
if (code) {
  await supabase.auth.exchangeCodeForSession(code)
}
redirect('/dashboard')
```

## Configuração Supabase (Auth Settings)

No dashboard Supabase → Authentication → Settings:

| Setting | Desenvolvimento | Produção |
|---|---|---|
| Site URL | `http://localhost:3000` | `https://seu-dominio.com` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://seu-dominio.com/auth/callback` |
| Email confirmations | Desabilitado | Habilitado |
| Secure email change | Habilitado | Habilitado |

## Troubleshooting Supabase

| Erro | Causa | Solução |
|---|---|---|
| `JWT expired` | Sessão expirada | `supabase.auth.refreshSession()` ou logout |
| `Row violates RLS` | Query sem auth | Verificar se `getUser()` foi chamado |
| `Function not found` | RPC inexistente | Re-executar migration SQL |
| `unique violation` | Insert duplicado | Use upsert ou ON CONFLICT |
| Cookie loop em middleware | Configuração SSR errada | Verificar `server.ts` de cookies |
