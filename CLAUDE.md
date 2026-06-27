# Matema — Guia para Agentes de IA

> Este arquivo vale para **qualquer agente** (Claude Code, Codex, etc.) que trabalhe neste repositório.
> Para regras específicas do app Next.js, veja `math-journey-frontend/AGENTS.md`.

## O que é o Matema

Plataforma EdTech gamificada de matemática para estudantes brasileiros (foco ENEM): XP, níveis, moedas, ELO ranqueado, avatar SVG procedural e loja, com conteúdo matemático estruturado e renderização LaTeX.

Stack: **Next.js 16** (App Router + RSC + Server Actions + Turbopack) · **React 19** · **TypeScript strict** · **Tailwind v4** · **KaTeX** · **Supabase** (PostgreSQL + Auth + RLS) · **Vercel**, em **DDD**. O app inteiro vive em `math-journey-frontend/`; `math-journey-backend/` guarda só o schema (migrations + seed).

## Memória do projeto: leia antes, atualize depois

Este projeto mantém uma **memória durável em dois lugares espelhados**. Saber em qual deles você está é a primeira coisa a fazer.

### 1. Sempre: `docs/` + `skills/` neste repositório (fonte canônica)

Estas pastas são versionadas no Git e viajam para **todos** os colaboradores. São a **fonte da verdade** da arquitetura, domínio, schema, decisões e padrões.

**Antes de começar qualquer tarefa:**
1. Leia `skills/001-project-context.md`.
2. Leia o doc relevante em `docs/` para a área que vai mexer (ver índice abaixo).
3. Explore o código real — não assuma estrutura.

**Ao terminar qualquer tarefa:**
4. Rode o checklist de `skills/008-documentation-maintenance.md` e atualize os docs/skills afetados.
5. Registre decisões técnicas não-óbvias em `docs/DECISIONS.md`.
> Uma tarefa sem documentação atualizada **não está concluída**.

> ⚠️ **SEMPRE atualize a documentação após grandes mudanças e novas features.** Quanto maior
> a mudança (nova feature, nova tabela/RPC, nova server action, mudança de arquitetura,
> upgrade de stack), mais obrigatória é a doc — ela é **parte da entrega**, não um "depois".
> Espere mexer em vários docs de uma vez (`ROADMAP`, `DATABASE`, `API`, `DOMAIN_MODEL`,
> `GLOSSARY`, `DECISIONS` + a skill correspondente). Documentação viva mantém o
> desenvolvimento rápido, seguro e sem retrabalho. Ver `skills/008-documentation-maintenance.md`.

### 2. Se (e só se) você tiver acesso: o vault Obsidian do dono

O dono (Davi) mantém um vault Obsidian privado, em
`/Volumes/Davi SSD 1/SegundoCerebroObsidian/Segundo Cerebro dev`,
que serve de memória cross-project dos produtos Kelps. **O vault NÃO está no GitHub.**

- **Se você tem acesso ao vault** (você é um agente do Davi): leia `_context/claude-context.md` → `Project Index - Matema Math` → notas relevantes, como contexto adicional. Ao terminar uma mudança arquitetural/durável, atualize **os dois lados**: primeiro `docs/`+`skills/` (canônico) e depois espelhe no vault (`01 - Projetos/Matema`, `02 - Arquitetura`, `03 - Dominios`). Detalhes em `skills/009-vault-bridge.md`. Você pode usar a skill `kelps-vault-sync`.
- **Se você NÃO tem acesso ao vault** (você é um agente de um colaborador): isso é **esperado e suportado**. Não tente acessar o vault. Sua memória oficial é `docs/` + `skills/` neste repo — leia e atualize só isso. O dono propaga suas mudanças para o vault depois do `git pull`.

Em caso de divergência entre repo e vault, **o repo vence**. A direção de sincronização é repo → vault.

Ver `skills/009-vault-bridge.md` e, no vault, `Decisao - Memoria Compartilhada Matema (Vault + Repo)`.

## Regras inegociáveis de engenharia

1. **Nunca** acesse Supabase em Client Components — use Server Actions ou RSC.
2. **Domain layer** (`src/domain/`) tem zero imports de Supabase/Next/React.
3. Toda mutação passa por **Server Action** com validação **Zod** + `revalidatePath`.
4. Operações atômicas (XP, moedas, compra) usam **RPC SQL** (`award_lesson_completion`, `purchase_item`), nunca updates diretos.
5. Use `supabase.auth.getUser()` (valida no servidor), **nunca** `getSession()`.
6. **RLS ativo** — jamais use `service_role` no frontend.
7. A fórmula de XP/nível (`level = floor(sqrt(xp/50)) + 1`) vive em `src/domain/user/entities/User.ts` **e** na function SQL `xp_to_level` — mantenha as duas sincronizadas.
8. Nunca commite `.env.local` nem chaves.

Detalhe completo em `skills/007-future-agent-instructions.md`.

## Índice da documentação (`docs/`)

| Doc | Assunto |
|---|---|
| `PROJECT_OVERVIEW.md` | Visão de produto, público, features |
| `ARCHITECTURE.md` / `DDD_STRUCTURE.md` | Camadas DDD, fluxo Next.js |
| `DOMAIN_MODEL.md` | Entidades, invariantes, regras de negócio |
| `DATABASE.md` | Schema, RLS, functions SQL |
| `API.md` | Server Actions (input/output/efeitos) |
| `TECH_STACK.md` | Dependências e versões |
| `DECISIONS.md` | ADRs |
| `ROADMAP.md` | Status de features |
| `DEVELOPMENT_GUIDE.md` | Setup, env vars, deploy |
| `GLOSSARY.md` | Termos do projeto |
| `MAINTENANCE.md` | Regras de manutenção da própria doc |

> Nota: `docs/SUPABASE_INTEGRATION.md` trata de **integração Supabase** e `docs/CONTENT_PIPELINE.md` trata de **seed de conteúdo**.

## Skills para agentes (`skills/`)

`001` contexto · `002` regras de arquitetura · `003` DDD · `004` pipeline de conteúdo · `005` integração Supabase · `006` padrões de código · `007` instruções para agentes futuros · `008` manutenção de documentação (obrigatório ao fim de toda tarefa) · `009` ponte de memória vault↔repo.

## Comandos

```bash
cd math-journey-frontend
npm install
npm run dev     # Next dev (Turbopack)
npm run lint
npm run build
```
