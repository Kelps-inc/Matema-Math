# Skill 005 — Supabase Integration Patterns

> Nota: Este arquivo cobre os padrões de integração com Supabase usados no projeto.

## Clientes Supabase

### Server-side (Server Components, Server Actions)

```typescript
import { createClient } from '@/infrastructure/supabase/server'

// Em qualquer async Server Component ou Server Action:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Client-side (apenas se necessário — evite)

```typescript
import { createClient } from '@/infrastructure/supabase/client'

const supabase = createClient()
// use apenas para Realtime subscriptions futuras
```

## Padrões de query

### Select simples
```typescript
const { data, error } = await supabase
  .from('modules')
  .select('*')
  .order('order_index')

if (error) throw new Error(error.message)
return data
```

### Select com join
```typescript
const { data, error } = await supabase
  .from('lessons')
  .select(`
    *,
    exercises (*)
  `)
  .eq('id', lessonId)
  .single()
```

### Select com filtro de usuário (RLS garante, mas seja explícito)
```typescript
const { data } = await supabase
  .from('user_lesson_progress')
  .select('lesson_id')
  .eq('user_id', user.id)
```

### Upsert
```typescript
const { error } = await supabase
  .from('user_avatar_config')
  .upsert({
    user_id: user.id,
    skin_tone: config.skinTone,
    // ...
  })
```

### RPC (função SQL)
```typescript
// Recompensa lida de `lessons` dentro do RPC — não passe p_xp/p_coins (anti-cheat).
const { data, error } = await supabase.rpc('award_lesson_completion', {
  p_user_id: userId,
  p_lesson_id: lessonId
})

// data é o JSON retornado pela função
// ex: { xp, level, coins, awarded_xp, awarded_coins, already_completed }
```

## Auth patterns

### Verificar usuário (Server Action)
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Não autenticado' }
```

**Use `getUser()`**, não `getSession()`. `getUser()` valida o token com o servidor Supabase — mais seguro.

### Verificar admin
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single()

if (!profile?.is_admin) return { error: 'Sem permissão' }
```

## Tratamento de erros

```typescript
const { data, error } = await supabase.from('...').select('*')

if (error) {
  console.error('[SupabaseRepo]', error)
  throw new Error(error.message)  // propaga para o use case / action
}
```

Em Server Actions, capture e retorne como `{ error: string }`:

```typescript
try {
  const repo = new SupabaseXRepository(supabase)
  await repo.doSomething()
  return { success: true }
} catch (err) {
  return { error: err instanceof Error ? err.message : 'Erro desconhecido' }
}
```

## Cache e revalidação

Após mutations, sempre revalide as rotas afetadas:

```typescript
import { revalidatePath } from 'next/cache'

revalidatePath('/dashboard')
revalidatePath('/modulos')
revalidatePath('/ranqueada')
```

## Tipos gerados (opcional)

Se quiser tipos TypeScript gerados do schema Supabase:

```bash
npx supabase gen types typescript --project-id <project-id> > src/infrastructure/supabase/database.types.ts
```

Atualmente o projeto usa tipos manuais nas entidades de domínio.

## Variáveis de ambiente obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Ambas são `NEXT_PUBLIC_` pois precisam estar disponíveis no cliente SSR (para hidratação). O cliente server-side lê as mesmas variáveis via cookies de sessão.
