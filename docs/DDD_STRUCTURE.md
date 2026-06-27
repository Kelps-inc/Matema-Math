# DDD Structure — Matema

> **Manutenção:** Toda nova pasta, rota, use case, repositório ou convenção de nomenclatura **deve** ser refletida aqui imediatamente. Consulte `docs/MAINTENANCE.md`.

## Estrutura de pastas

```
math-journey-frontend/src/
├── app/                          # Next.js App Router (entrypoint das rotas)
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── entrar/page.tsx       # Login
│   │   └── cadastro/page.tsx     # Cadastro
│   ├── auth/callback/route.ts    # OAuth callback
│   ├── modulos/
│   │   ├── page.tsx              # Lista de módulos
│   │   └── [slug]/page.tsx       # Detalhe de módulo + lições
│   ├── licao/[lessonId]/page.tsx # Player de exercícios
│   ├── ranqueada/
│   │   ├── page.tsx              # Hub ranqueado / leaderboard
│   │   ├── placement/page.tsx    # Placement test
│   │   └── jogar/
│   │       ├── page.tsx          # Seleção de modo
│   │       └── [mode]/page.tsx   # Player ranqueado
│   ├── dashboard/page.tsx        # Dashboard principal
│   ├── avatar/page.tsx           # Editor de avatar
│   ├── loja/page.tsx             # Loja de itens
│   ├── amigos/page.tsx           # Amigos + Duelos 1v1
│   ├── configuracoes/page.tsx    # Configurações
│   ├── admin/
│   │   └── preview-questoes/     # Admin: preview de exercícios
│   └── actions/                  # Server Actions
│       ├── auth.ts               # signUp, signIn, signOut
│       ├── progress.ts           # completeLessonAction
│       ├── answers.ts            # checkExerciseAnswerAction, checkPlacementAnswerAction (anti-cheat)
│       ├── ranked.ts             # saveRankedGameAction
│       ├── elo.ts                # savePlacementAction
│       ├── simulado.ts           # sessão do Simulado ENEM (get/upsert/delete/abandon)
│       ├── duelo.ts              # Duelos 1v1 + Amizades
│       ├── shop.ts               # purchaseItemAction, setItemEquippedAction
│       ├── avatar.ts             # saveAvatarConfigAction
│       └── account.ts            # resetProgressAction, deleteAccountAction
│
├── application/                  # Use Cases (camada de aplicação)
│   └── use-cases/
│       ├── GetModulesUseCase.ts
│       ├── GetLessonUseCase.ts
│       └── CompleteLessonUseCase.ts
│
├── domain/                       # Entidades e interfaces (núcleo do domínio)
│   ├── user/
│   │   └── entities/
│   │       └── User.ts
│   └── learning/
│       ├── entities/
│       │   ├── Module.ts
│       │   ├── Lesson.ts
│       │   └── Exercise.ts
│       └── repositories/
│           ├── IUserRepository.ts
│           ├── ILearningRepository.ts
│           └── IProgressRepository.ts
│
├── infrastructure/               # Implementações Supabase
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient()
│   │   └── server.ts             # createServerClient() com cookies
│   └── repositories/
│       ├── SupabaseUserRepository.ts
│       ├── SupabaseLearningRepository.ts
│       └── SupabaseProgressRepository.ts
│
└── presentation/                 # Componentes React
    ├── components/
    │   ├── game/
    │   │   ├── ExercisePlayer.tsx     # Player de lições normais
    │   │   ├── PlacementPlayer.tsx    # Placement test ELO
    │   │   ├── RankedPlayer.tsx       # Player modo ranqueado
    │   │   ├── GameHeader.tsx
    │   │   ├── GameBackground.tsx
    │   │   ├── ModuleCard.tsx
    │   │   └── MobileBottomNav.tsx
    │   ├── avatar/
    │   │   ├── Avatar.tsx             # Renderizador SVG
    │   │   ├── AvatarEditor.tsx       # UI de customização
    │   │   └── AvatarConfig.ts        # Opções e constantes
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   ├── ProgressBar.tsx
    │   │   └── MathText.tsx           # Renderizador LaTeX
    │   ├── shop/
    │   │   └── ShopGrid.tsx
    │   └── settings/
    │       └── SettingsClient.tsx
    └── lib/
        ├── audio.ts                   # SFX via Web Audio API
        └── AudioManager.tsx           # Context provider de áudio
```

## Convenções de nomenclatura

| Elemento | Padrão | Exemplo |
|---|---|---|
| Entidades de domínio | PascalCase | `User`, `Exercise` |
| Interfaces de repositório | `I` + PascalCase | `IUserRepository` |
| Implementações | Prefixo da tech + PascalCase | `SupabaseUserRepository` |
| Use Cases | PascalCase + `UseCase` | `GetModulesUseCase` |
| Server Actions | camelCase + `Action` | `completeLessonAction` |
| Páginas Next.js | `page.tsx` | `src/app/dashboard/page.tsx` |
| Server Actions arquivo | domínio curto | `progress.ts`, `ranked.ts` |
| Componentes React | PascalCase | `ExercisePlayer` |
| Hooks | `use` + PascalCase | `useAudio` |

## Regras de dependência

```
app → application → domain ← infrastructure
app → infrastructure (para instanciar repositórios)
presentation → domain (tipos)
presentation → app/actions (chamadas)
```

**Proibido:**
- `domain` importar de `infrastructure`, `app` ou `presentation`
- `application` importar de `presentation` ou `app`
- `infrastructure` importar de `application` ou `presentation`
- Componentes Client importar Supabase diretamente

## Como adicionar uma nova feature

1. **Defina a entidade** em `domain/` se necessário
2. **Adicione método** na interface de repositório em `domain/*/repositories/`
3. **Implemente** em `infrastructure/repositories/`
4. **Crie use case** em `application/use-cases/` se houver orquestração
5. **Server Action** em `app/actions/` para mutações (com validação Zod)
6. **RSC Page** em `app/` para leitura
7. **Componentes React** em `presentation/components/`

## Como instanciar repositórios em RSC

```typescript
// app/modulos/page.tsx (Server Component)
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetModulesUseCase } from '@/application/use-cases/GetModulesUseCase'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const repo = new SupabaseLearningRepository(supabase)
  const useCase = new GetModulesUseCase(repo)
  const modules = await useCase.execute(user!.id)
  
  return <ModuleList modules={modules} />
}
```
