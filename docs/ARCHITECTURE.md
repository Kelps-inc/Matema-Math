# Architecture — Matema

## Visão geral

Matema usa uma arquitetura **Domain-Driven Design (DDD)** dentro de uma aplicação **Next.js 15** com App Router. O backend é inteiramente gerenciado pelo **Supabase** (PostgreSQL + Auth + RLS).

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Client                     │
│  React 19 Client Components (game players, forms, etc.) │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP / Server Actions
┌─────────────────────────▼───────────────────────────────┐
│              Next.js 15 (App Router)                     │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  RSC Pages  │  │Server Actions│  │  API Routes   │  │
│  │ (read data) │  │ (mutations)  │  │ (auth callback│  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │           │
│  ┌──────▼────────────────▼───────────────────▼───────┐  │
│  │              Application Layer (Use Cases)         │  │
│  │  GetModulesUseCase  GetLessonUseCase               │  │
│  │  CompleteLessonUseCase  (orchestration only)       │  │
│  └──────────────────────┬────────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────▼────────────────────────────┐  │
│  │                  Domain Layer                       │  │
│  │  User  Module  Lesson  Exercise  (pure entities)   │  │
│  │  IUserRepository  ILearningRepository  (interfaces)│  │
│  └───────────────────────┬────────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────▼────────────────────────────┐  │
│  │              Infrastructure Layer                   │  │
│  │  SupabaseUserRepository                            │  │
│  │  SupabaseLearningRepository                        │  │
│  │  SupabaseProgressRepository                        │  │
│  └───────────────────────┬────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │ Supabase Client (SSR)
┌──────────────────────────▼──────────────────────────────┐
│                    Supabase                              │
│  PostgreSQL  Auth  RLS  Functions  Realtime (futuro)    │
└─────────────────────────────────────────────────────────┘
```

## Camadas

### Presentation Layer (`src/presentation/`)
Componentes React com UI pura. Recebem props tipadas, não acessam Supabase diretamente.

### App Layer (`src/app/`)
- **RSC Pages**: Buscam dados via use cases ou repositórios, passam como props
- **Server Actions** (`src/app/actions/`): Mutações com validação Zod, chamam use cases
- **API Routes**: Apenas `/auth/callback` (redirect OAuth)

### Application Layer (`src/application/`)
Use cases que orquestram domínio + infraestrutura. Sem lógica de UI, sem Supabase direto.

### Domain Layer (`src/domain/`)
Entidades puras com lógica de negócio. **Zero dependências externas** (nem Supabase, nem Next.js).

### Infrastructure Layer (`src/infrastructure/`)
Implementações dos repositórios usando Supabase. Traduz DTOs do banco para entidades de domínio.

## Fluxo de dados — leitura (RSC)

```
Page (RSC)
  → instancia repositório (new SupabaseLearningRepository(supabase))
  → chama use case (new GetModulesUseCase(repo).execute(userId))
  → use case chama repo → repo busca no Supabase → retorna entidades
  → RSC passa entidades como props para Client Components
```

## Fluxo de dados — mutação (Server Action)

```
Client Component (ex: ExercisePlayer)
  → chama Server Action (completeLessonAction(payload))
  → action valida com Zod
  → instancia repositório + use case
  → use case executa lógica de negócio
  → repositório chama RPC Supabase (award_lesson_completion)
  → action chama revalidatePath()
  → retorna { success: true } ou { error: 'mensagem' }
```

## Decisões arquiteturais chave

- **Server Components por padrão**: Reduz bundle JS. Apenas game players e formulários são `'use client'`
- **Server Actions em vez de API Routes**: Mutações mais simples, validação co-localizada, type-safe end-to-end
- **DDD sem CQRS**: Simplicidade — use cases servem tanto leitura quanto escrita para o MVP
- **Repositórios no servidor**: Nunca expõe lógica de acesso ao banco no cliente
- **RPC para operações atômicas**: `award_lesson_completion` e `purchase_item` são funções SQL para garantir atomicidade

## Autenticação

```
Browser → signIn Server Action → supabase.auth.signInWithPassword()
Supabase → retorna session (cookie HttpOnly via @supabase/ssr)
Server Components → leem session do cookie
Client Components → não acessam auth diretamente
```
