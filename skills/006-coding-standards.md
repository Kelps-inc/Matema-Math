# Skill 006 — Coding Standards

## TypeScript

- **Strict mode** ativo — sem `any` implícito, sem `!` sem justificativa
- **Sem `as any`** — use type guards ou refatore o tipo
- **Interfaces para contratos** (repositórios, props de componente)
- **Types para unions e aliases** (`type EloTier = 'bronze' | 'prata' | ...`)
- Path alias: `@/` mapeia para `src/` — sempre use, nunca relative `../../`

## Nomenclatura

| Elemento | Padrão | Exemplo |
|---|---|---|
| Componentes React | PascalCase | `ExercisePlayer` |
| Funções | camelCase | `completeLessonAction` |
| Constantes | UPPER_SNAKE | `ELO_TIER_LABELS` |
| Arquivos de componente | PascalCase.tsx | `AvatarEditor.tsx` |
| Arquivos de util/lib | camelCase.ts | `audio.ts` |
| Arquivos de página | page.tsx | (padrão Next.js) |
| Interfaces de repo | `I` + PascalCase | `IUserRepository` |
| Implementações Supabase | `Supabase` + PascalCase | `SupabaseUserRepository` |
| Use Cases | PascalCase + `UseCase` | `GetModulesUseCase` |
| Server Actions | camelCase + `Action` | `purchaseItemAction` |

## Comentários

**Escreva zero comentários** salvo quando o WHY não é óbvio:
- Workaround para bug específico de browser
- Invariante não-óbvia de negócio
- Comportamento que surpreenderia um leitor

Nunca escreva comentários explicando O QUÊ o código faz — os nomes devem fazer isso.

## Componentes React

### Server Component (padrão)
```typescript
// Sem 'use client', async, recebe dados prontos
export default async function ModulosPage() {
  const modules = await getModules()
  return <ModuleList modules={modules} />
}
```

### Client Component (quando necessário)
```typescript
'use client'
// Apenas quando: estado, eventos, timers, Web Audio, animações
export function ExercisePlayer({ lesson }: Props) {
  const [current, setCurrent] = useState(0)
  // ...
}
```

### Props tipadas sempre
```typescript
interface Props {
  lesson: Lesson
  onComplete: (result: GameResult) => void
}
```

## Server Actions

```typescript
'use server'
// 1. Validação Zod sempre
// 2. Auth sempre (getUser, não getSession)
// 3. Retorno: { success: true } ou { error: string }
// 4. revalidatePath ao final de mutações
```

## Tailwind CSS

- Classes utilitárias direto no JSX — sem CSS modules ou `styled-components`
- Use variáveis CSS customizadas (`--matema-primary`, etc.) para cores do tema
- Modo escuro via classe `dark:` + classe `dark` no `<html>`
- Mobile-first: classes base = mobile, `md:` `lg:` = breakpoints maiores

## Zod validation

```typescript
const schema = z.object({
  lessonId: z.string().uuid('ID inválido'),
  answers: z.array(z.object({
    exerciseId: z.string().uuid(),
    answer: z.string().min(1),
    isCorrect: z.boolean(),
  })).min(1, 'Pelo menos uma resposta obrigatória')
})

const parsed = schema.safeParse(payload)
if (!parsed.success) {
  return { error: parsed.error.flatten().formErrors[0] || 'Dados inválidos' }
}
```

## LaTeX em questões

- Inline: `$expressão$` (evite espaço após `$`)
- Display: `$$expressão$$`
- Caracteres especiais em strings JS: use `\\frac`, `\\sqrt`, etc.
- Teste sempre no componente `MathText` — parser usa regex com lookbehind

## Erros e logging

- Server Actions: retorne `{ error: string }` (nunca throw ao cliente)
- Repositórios: `throw new Error(error.message)` — capturado no use case/action
- Use `console.error('[NomeDoContexto]', error)` antes de re-throw
- Não use `console.log` em produção — remova antes de commitar

## Imports — ordem

1. React e Next.js
2. Bibliotecas externas (zod, katex)
3. `@/domain/...`
4. `@/infrastructure/...`
5. `@/application/...`
6. `@/presentation/...`
7. Tipos (import type)
