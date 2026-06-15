# Skill 009 — Ponte de Memória Vault ↔ Repositório

> Como a memória durável do Matema é mantida quando parte da equipe tem um vault Obsidian e parte não.

## O problema

O Matema é desenvolvido por mais de uma pessoa. O dono (Davi) usa agentes de IA com acesso a um **vault Obsidian privado** (`Segundo Cerebro dev`) que serve de memória cross-project. Colaboradores usam seus próprios agentes, **sem acesso a esse vault**. E o vault **não vai para o GitHub**.

Sem uma regra clara, o conhecimento do projeto se fragmentaria.

## A solução: uma fonte canônica + um espelho

| Superfície | Onde | Papel | Quem mantém |
|---|---|---|---|
| **`docs/` + `skills/`** | Neste repo (Git/GitHub) | **Fonte canônica.** Viaja para todo colaborador. | **Todo** agente, com ou sem vault |
| **Vault Obsidian** | `/Volumes/Davi SSD 1/SegundoCerebroObsidian/Segundo Cerebro dev` | Espelho cross-project navegável | Só agentes do dono |

Regra de ouro: **a direção de sincronização é repo → vault.** Em divergência, o repo vence. Ninguém precisa do vault para trabalhar no Matema.

## Qual agente sou eu?

### Não tenho acesso ao vault (agente de colaborador)

Isso é o caminho normal e suportado. **Não tente acessar o vault.**

- Antes da tarefa: `skills/001-project-context.md` + doc relevante em `docs/`.
- Depois da tarefa: atualize `docs/` + `skills/` conforme `skills/008-documentation-maintenance.md`.
- É só isso. Quando o dono fizer `git pull`, os agentes dele propagam suas mudanças para o vault.

### Tenho acesso ao vault (agente do Davi)

1. **Leitura (contexto extra):** comece por `_context/claude-context.md` no vault → nota `Project Index - Matema Math` → notas relevantes. Isso dá contexto cross-project; **não substitui** ler `docs/` e o código.
2. **Escrita (ao terminar mudança arquitetural/durável):**
   - **Primeiro** atualize `docs/` + `skills/` neste repo (canônico).
   - **Depois** espelhe o que for arquitetural/durável/cross-project no vault:
     - `01 - Projetos/Matema/Matema Math.md` e `STATUS - Matema Math.md`
     - `_context/Project Index - Matema Math.md`
     - `02 - Arquitetura/Arquitetura - Matema Math.md`
     - `03 - Dominios/Dominio - Aprendizado Gamificado.md`
     - ADRs em `05 - Decisoes/` quando houver decisão
   - Você pode usar a skill `kelps-vault-sync` para isso.
3. **Após `git pull` com mudanças de colaboradores:** revise os diffs de `docs/`+`skills/` e reflita no vault o que for arquitetural.

## O que NÃO fazer

- **Não** trate o vault como fonte canônica — ele é espelho.
- **Não** atualize só o vault e esqueça `docs/`+`skills/` — colaboradores sem vault ficariam cegos.
- **Não** copie para o vault detalhe efêmero (WIP, estado de PR) — isso fica no Git.
- **Não** assuma que todo agente tem vault. O `CLAUDE.md` da raiz deixa os dois caminhos explícitos.

## Referência

- `CLAUDE.md` e `AGENTS.md` na raiz do repo.
- No vault: `Decisao - Memoria Compartilhada Matema (Vault + Repo)` e `Contexto de Agentes`.
