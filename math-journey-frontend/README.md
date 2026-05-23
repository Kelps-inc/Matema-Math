# Matema — Frontend

Plataforma gamificada de matemática (básico ao ENEM), construída com Next.js 16, TypeScript, Tailwind CSS e Supabase.

## Stack

- **Framework**: Next.js 16.2 (App Router, Turbopack)
- **Linguagem**: TypeScript (strict)
- **Estilos**: Tailwind CSS v4
- **Banco de dados / Auth**: Supabase
- **Arquitetura**: DDD (Domain-Driven Design)

## Setup

### Pré-requisitos

- Node.js 20+
- Projeto Supabase configurado (ver `../math-journey-backend/README.md`)

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Crie `.env.local` na raiz com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Build de produção

```bash
npm run build
npm start
```

## Deploy na Vercel

1. Conecte o repositório no [vercel.com](https://vercel.com)
2. Configure as variáveis de ambiente no painel da Vercel
3. O deploy é automático a cada push no `main`

---

## Estrutura do projeto (DDD)

```
src/
  domain/              # Entidades, value objects, interfaces de repositório
    user/
    learning/          # Module, Lesson, Exercise
    progression/
  application/         # Use cases — orquestram o domínio
    use-cases/
  infrastructure/      # Implementações concretas (Supabase)
    supabase/          # client.ts, server.ts, types.ts
    repositories/      # SupabaseLearningRepository, etc.
  presentation/        # Componentes React, utilitários de UI
    components/
      ui/              # Button, Card, Badge, ProgressBar
      game/            # StatBar, ModuleCard, ExercisePlayer, GameHeader
    lib/utils.ts
  app/                 # Next.js App Router
    actions/           # Server Actions (auth, progress)
    proxy.ts           # Auth proxy
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/entrar` | Login |
| `/cadastro` | Cadastro |
| `/dashboard` | Hub principal do jogador |
| `/modulos` | Lista de módulos |
| `/modulos/[slug]` | Detalhe do módulo com lições |
| `/licao/[lessonId]` | Player de exercícios |
