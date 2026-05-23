# Matema 📐

> Plataforma gamificada de matemática do básico ao ENEM — aprenda no seu ritmo, ganhe recompensas e evolua.

---

## Visão geral

O **Matema** é uma plataforma de ensino de matemática com gamificação profunda, estética acolhedora e foco total no ENEM. O aluno ganha XP, moedas e sobe de nível conforme completa lições — sem pixel art, sem visual pesado de RPG.

**Gap de mercado:** nenhuma plataforma brasileira combina gamificação profunda + contextualização para o ENEM + experiência visual moderna e acolhedora.

---

## Estrutura do repositório

```
Matema/
├── math-journey-frontend/   # Aplicação Next.js (App Router)
└── math-journey-backend/    # Schema do banco de dados (Supabase)
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Linguagem | TypeScript (strict) |
| Estilos | Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth |
| Deploy | Vercel |
| Arquitetura | DDD (Domain-Driven Design) |

---

## Arquitetura (DDD)

```
src/
  domain/          # Entidades e regras de negócio puras
    user/          # User (XP→nível, progresso)
    learning/      # Module, Lesson, Exercise
    progression/   # Interfaces de progressão
  application/     # Use cases (orquestram o domínio)
  infrastructure/  # Repositórios Supabase, cliente SSR/browser
  presentation/    # Componentes React, hooks, utilitários UI
  app/             # Rotas Next.js (App Router)
```

---

## Conteúdo do MVP

| Módulo | Tópicos |
|--------|---------|
| 🔢 Números e Operações | MMC, MDC, frações, potências, expressões numéricas |
| 📐 Álgebra e Funções | Equações, funções de 1º e 2º grau, progressões |
| 📏 Geometria | Plana, espacial, trigonometria e analítica |
| 📊 Estatística e Probabilidade | Média, mediana, moda, probabilidade clássica |

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/entrar` | Login |
| `/cadastro` | Cadastro |
| `/dashboard` | Hub principal do jogador |
| `/modulos` | Lista de módulos |
| `/modulos/[slug]` | Lições de um módulo |
| `/licao/[lessonId]` | Player de exercícios |

---

## Setup rápido

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute na ordem:
   - [`math-journey-backend/supabase/migrations/001_initial_schema.sql`](math-journey-backend/supabase/migrations/001_initial_schema.sql)
   - [`math-journey-backend/supabase/seed/001_content.sql`](math-journey-backend/supabase/seed/001_content.sql)
3. Em **Authentication > Settings**, adicione `http://localhost:3000/auth/callback` às Redirect URLs

### 2. Frontend

```bash
cd math-journey-frontend
npm install
```

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy (Vercel)

1. Conecte este repositório no [vercel.com](https://vercel.com)
2. Configure as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Push para `main` faz deploy automático

---

## Roadmap pós-MVP

- [ ] **Streak e calendário** — sequência de dias estudando
- [ ] **Duelos 1v1** — desafios em tempo real contra outros usuários
- [ ] **Simulado ENEM** — prova completa cronometrada com ranking
- [ ] **Conquistas/badges** — troféus por milestones
- [ ] **Leaderboard** — ranking semanal
- [ ] **Tutor IA** — explicação personalizada ao errar uma questão
- [ ] **Plano de estudo** — cronograma gerado pela data da prova
- [ ] **Modo Turma** — professores acompanham progresso de alunos
- [ ] **Temas visuais** — personalização do ambiente de estudos

---

## Concorrentes

| Produto | Ponto fraco que o Matema supera |
|---------|--------------------------------|
| Descomplica | Sem gamificação real |
| Stoodi | Visual datado, sem progressão tipo jogo |
| QConcursos | Árido, zero engajamento |
| Khan Academy | Badges fracos, UX cansativa |
| Brilliant.org | Só em inglês, premium caro |

---

## Licença

MIT
