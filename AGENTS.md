# Matema — Instruções para Agentes

As diretrizes completas estão em **`CLAUDE.md`** (na raiz). Leia esse arquivo primeiro — vale para qualquer agente, não só Claude.

## Resumo do que você não pode pular

1. **Memória do projeto, fonte canônica = `docs/` + `skills/` deste repo.** Antes de qualquer tarefa, leia `skills/001-project-context.md` e o doc relevante em `docs/`. Ao terminar, atualize-os seguindo `skills/008-documentation-maintenance.md`. **Tarefa sem doc atualizada NÃO está concluída — sem exceção.** Em **grandes mudanças e novas features** (nova tabela/RPC, nova server action, mudança de arquitetura, upgrade de stack) atualizar a documentação é **parte da entrega**, não um "depois": espere mexer em vários docs de uma vez (`ROADMAP`, `DATABASE`, `API`, `DOMAIN_MODEL`, `GLOSSARY`, `DECISIONS` + a skill correspondente). Doc viva = desenvolvimento rápido e confiável.

2. **Vault Obsidian (opcional, só para agentes do dono).** Existe um vault privado fora do Git em `/Volumes/Davi SSD 1/SegundoCerebroObsidian/Segundo Cerebro dev`. Se você tem acesso, use-o como contexto extra e espelhe mudanças arquiteturais nele depois de atualizar `docs/`+`skills/`. **Se você não tem acesso, é esperado** — não tente acessá-lo; sua memória oficial é `docs/`+`skills/`. Em divergência, o repo vence. Detalhes em `skills/009-vault-bridge.md`.

3. **Regras de engenharia:** sem Supabase em Client Components; domain layer sem deps externas; mutações via Server Action + Zod + `revalidatePath`; operações atômicas via RPC SQL; `getUser()` não `getSession()`; RLS ativo, nunca `service_role` no front. Ver `skills/007-future-agent-instructions.md`.

Detalhes específicos do app Next.js: `math-journey-frontend/AGENTS.md`.
