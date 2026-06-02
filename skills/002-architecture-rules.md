# Skill 002 — Architecture Rules

## Regras de dependência entre camadas

```
PERMITIDO:
  app         → application, infrastructure, domain, presentation
  application → domain, infrastructure
  infrastructure → domain
  presentation → domain (tipos apenas)

PROIBIDO:
  domain → qualquer coisa
  application → presentation, app
  infrastructure → application, presentation, app
  Client Components → Supabase diretamente
```

## Como criar um Server Component (leitura)

```typescript
// src/app/minha-rota/page.tsx
import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')
  
  // instancie repositório, busque dados
  const repo = new SupabaseLearningRepository(supabase)
  const data = await repo.findAllModules()
  
  return <MeuComponente data={data} />
}
```

## Como criar uma Server Action (mutação)

```typescript
// src/app/actions/meu-dominio.ts
'use server'
import { z } from 'zod'
import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  campo: z.string().uuid()
})

export async function minhaAction(payload: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  
  const parsed = schema.safeParse(payload)
  if (!parsed.success) return { error: 'Dados inválidos' }
  
  // lógica de negócio via repositório ou use case
  
  revalidatePath('/rota-afetada')
  return { success: true }
}
```

## Padrão de retorno de Server Actions

```typescript
// Sempre retorne um desses:
{ success: true, ...dadosOpcionais }
{ error: 'mensagem legível pelo usuário' }
```

## Quando usar Client Component (`'use client'`)

Use APENAS quando necessário:
- Game players (ExercisePlayer, RankedPlayer, PlacementPlayer)
- Formulários com estado local
- Componentes com timers ou Web Audio API
- Editor de avatar

**Não use** `'use client'` em pages, layouts ou componentes puramente exibição.

## Operações atômicas — use RPC

Para operações que modificam múltiplas tabelas atomicamente, use funções SQL via RPC:

```typescript
const { data, error } = await supabase.rpc('award_lesson_completion', {
  p_user_id: user.id,
  p_lesson_id: lessonId,
  p_xp: xp,
  p_coins: coins
})
```

**Nunca** faça múltiplos updates sequenciais onde uma falha parcial causaria inconsistência.

## Adicionando um campo ao schema

1. Escreva SQL de migração
2. Execute no Supabase SQL Editor
3. Atualize a entidade em `domain/`
4. Atualize o repositório em `infrastructure/`
5. Atualize server action se necessário
6. **Não** crie migrations automáticas sem revisar com o dev

## Autenticação — checklist

- [ ] `createClient()` importado de `@/infrastructure/supabase/server`
- [ ] `supabase.auth.getUser()` chamado (não `getSession()` — getUser valida com servidor)
- [ ] Redirect para `/entrar` se não autenticado
- [ ] `user.id` usado como `userId` em todas as queries
