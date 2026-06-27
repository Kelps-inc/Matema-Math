# Skill 001 — Project Context

## O que é este projeto

**Matema** é uma plataforma gamificada de aprendizado de matemática para estudantes brasileiros (ensino médio, foco ENEM). Combina mecânicas de jogos (XP, ELO, avatares, loja) com lições de matemática estruturadas.

## Stack em uma linha

Next.js 16 (App Router + RSC + Server Actions + Turbopack) + React 19 + TypeScript strict + Tailwind CSS v4 + KaTeX + Supabase (PostgreSQL + Auth + RLS) + Vercel deploy.

## Localização dos arquivos principais

```
math-journey-frontend/src/
  app/              → rotas Next.js + server actions (app/actions/)
  application/      → use cases
  domain/           → entidades e interfaces de repositório (puro TS)
  infrastructure/   → repositórios Supabase
  presentation/     → componentes React

math-journey-backend/supabase/
  migrations/001_initial_schema.sql        → schema base
  migrations/002_harden_lesson_rewards.sql → anti-cheat do award_lesson_completion
  migrations/003_simulado_sessions.sql     → sessões do Simulado ENEM
  migrations/004_duels_and_friendships.sql → Duelos 1v1 + Amizades
  seed/001_content.sql                     → módulos, lições, exercícios
```

## Regras fundamentais para qualquer agente

1. **Nunca acesse Supabase em Client Components** — use Server Actions ou RSC
2. **Domain layer tem zero dependências externas** — sem imports de Supabase, Next.js, React
3. **Toda mutação usa Server Action** com validação Zod + `revalidatePath`
4. **Operações atômicas (XP, moedas, compra) usam RPC SQL**, não updates diretos
5. **RLS está ativo** — operações de banco como service role podem bypassar; não faça isso sem necessidade
6. **Toda alteração no código exige atualização da documentação correspondente** — leia `skills/008-documentation-maintenance.md` antes de encerrar qualquer tarefa

## Entidades principais

- `User` — jogador com XP, nível, moedas, ELO
- `Module` → `Lesson` → `Exercise` — hierarquia de conteúdo
- `PlacementQuestion` — questões do placement test ELO

## Features core

- Lições com exercícios e teoria
- XP + nível + moedas
- ELO ranqueado (Bronze → Mestre, LP 0–99) — modos Objetivas, Estilo ENEM e **Simulado ENEM** (45 questões)
- **Duelos 1v1** assíncronos (rating próprio `duel_rating`) + página de **Amigos**
- Avatar SVG procedural
- Loja de cosméticos
- Renderização LaTeX ($...$ e $$...$$)
- Áudio ambiente + SFX Web Audio API
- Validação de resposta **server-side** (gabarito nunca vai ao cliente) e recompensa anti-cheat no RPC

> Sempre que adicionar/alterar uma feature, **atualize a documentação** (`docs/` + `skills/`) antes de encerrar — ver regra 6 abaixo e `skills/008-documentation-maintenance.md`.

## Onde encontrar mais detalhes

- Arquitetura: `docs/ARCHITECTURE.md`
- Schema banco: `docs/DATABASE.md`
- API / Server Actions: `docs/API.md`
- Estrutura DDD: `docs/DDD_STRUCTURE.md`
- Roadmap: `docs/ROADMAP.md`
- **Manutenção da documentação: `docs/MAINTENANCE.md` + `skills/008-documentation-maintenance.md`**
