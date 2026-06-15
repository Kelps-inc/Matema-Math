# Skill 008 — Documentation Maintenance (OBRIGATÓRIO)

> **Este skill é ativado ao final de TODA tarefa.**  
> Não é opcional. Não tem exceção para "tarefas pequenas".  
> Se você alterou código, verifique se a documentação precisa ser atualizada.

---

## A regra em uma linha

**Código mudou → documentação atualizada. Sempre. Sem exceção.**

---

## Antes de declarar qualquer tarefa concluída

Execute este checklist. Para cada item marcado ✅, atualize o documento indicado.

```
BANCO DE DADOS
[ ] Criei/modifiquei tabela, coluna, enum, index → docs/DATABASE.md
[ ] Criei/modifiquei function SQL ou trigger      → docs/DATABASE.md
[ ] Modifiquei política RLS                       → docs/DATABASE.md

DOMÍNIO
[ ] Criei/modifiquei entidade de domínio          → docs/DOMAIN_MODEL.md
[ ] Criei/modifiquei interface de repositório     → docs/DOMAIN_MODEL.md + docs/DDD_STRUCTURE.md
[ ] Criei/modifiquei use case                     → docs/DDD_STRUCTURE.md

API / SERVER ACTIONS
[ ] Criei/modifiquei Server Action                → docs/API.md
[ ] Mudei input, output ou lógica de uma action   → docs/API.md
[ ] Adicionei nova rota Next.js                   → docs/DDD_STRUCTURE.md

TECNOLOGIA
[ ] Adicionei/removi biblioteca ou serviço        → docs/TECH_STACK.md
[ ] Tomei decisão técnica não-óbvia               → docs/DECISIONS.md (ADR)

PRODUTO
[ ] Concluí feature do roadmap                    → docs/ROADMAP.md (mover para ✅)
[ ] Iniciei feature planejada                     → docs/ROADMAP.md (marcar em progresso)
[ ] Feature foi cancelada ou descartada           → docs/ROADMAP.md (remover ou justificar)

CONTEÚDO
[ ] Mudei como exercícios/lições são inseridos    → docs/CONTENT_PIPELINE.md
                                                     skills/004-content-pipeline.md

INTEGRAÇÃO SUPABASE
[ ] Mudei padrão de query, auth ou RPC            → docs/SUPABASE_INTEGRATION.md
                                                     skills/005-supabase-integration.md

ARQUITETURA
[ ] Mudei estrutura de pastas ou camadas DDD      → docs/ARCHITECTURE.md
                                                     docs/DDD_STRUCTURE.md
                                                     skills/002-architecture-rules.md

PADRÕES DE CÓDIGO
[ ] Mudei convenção de nomenclatura ou estilo     → skills/006-coding-standards.md

AMBIENTE
[ ] Adicionei variável de ambiente                → docs/DEVELOPMENT_GUIDE.md

GLOSSÁRIO
[ ] Introduzi novo termo, sigla ou conceito       → docs/GLOSSARY.md

SKILLS DE AGENTES
[ ] Adicionei task recorrente nova ao projeto     → skills/007-future-agent-instructions.md

MEMÓRIA EXTERNA (VAULT — só agentes do dono)
[ ] Mudança arquitetural/durável E tenho vault    → espelhar no vault APÓS atualizar
                                                     docs/+skills/ (skills/009-vault-bridge.md)
```

> A fonte canônica é sempre `docs/`+`skills/` neste repo. O vault Obsidian é apenas
> espelho e só existe para agentes do dono — se você não tem acesso, ignore a linha acima.

---

## Como atualizar cada documento

### `docs/DATABASE.md`
- Adicione a nova tabela/coluna na seção correspondente com tipo e descrição
- Se modificou, remova a linha antiga e substitua
- Se adicionou function SQL, documente parâmetros e retorno
- Se removeu algo, remova da documentação — não deixe lixo

### `docs/DOMAIN_MODEL.md`
- Novas entidades: adicione com campos tipados e métodos calculados
- Novas invariantes: adicione na tabela "Invariantes de negócio"
- Interfaces modificadas: atualize a assinatura exibida

### `docs/API.md`
- Novas Server Actions: documente input (com validação Zod), output e efeitos colaterais
- Contratos modificados: atualize o bloco de input/output — nunca mantenha documentação de parâmetros removidos
- Inclua lógica de cálculo quando relevante (ELO, score, etc.)

### `docs/DECISIONS.md`
- Use o formato ADR (veja `docs/MAINTENANCE.md` para o template)
- Número sequencial após o último ADR existente
- Seja honesto sobre trade-offs — ADR sem trade-offs está incompleto

### `docs/ROADMAP.md`
- Features concluídas: mova para a seção "Concluído" com ✅
- Features novas: adicione na seção de prioridade correta com descrição clara
- Não deixe features "concluídas" na seção "Planejado"

### `docs/TECH_STACK.md`
- Nova biblioteca: adicione nome, versão aproximada, uso e justificativa na tabela correta
- Biblioteca removida: remova da tabela

### `docs/GLOSSARY.md`
- Um termo por linha na tabela
- Defina o significado no contexto do Matema, não a definição genérica

### `skills/007-future-agent-instructions.md`
- Novas tasks comuns: adicione na seção "Tasks comuns e onde mexer" com o padrão de setas (→)
- FAQ novo: adicione na seção "Perguntas frequentes para agentes"
- Referência de arquivo novo: adicione na tabela "Referência rápida de arquivos"

---

## O que NÃO fazer na documentação

- **Não** documente estado temporário ou WIP como se fosse definitivo
- **Não** deixe seções desatualizadas ao lado de seções novas — corrija ou remova
- **Não** escreva "TODO: documentar isso" — documente agora ou não mencione
- **Não** copie código de implementação sem adaptar para o contexto do doc
- **Não** invente comportamento que você não verificou — leia o código antes de documentar

---

## Quando a documentação existente estiver errada

Se durante uma tarefa você descobrir que um documento existente está desatualizado ou incorreto:

1. **Corrija imediatamente** — não continue o trabalho com documentação sabidamente errada
2. **Não avise e ignore** — "vi que estava errado mas não era minha tarefa" não é aceitável
3. Se a correção for grande demais para o escopo atual, avise o desenvolvedor explicitamente antes de continuar

---

## Referência rápida: documento → tipo de mudança

| Documento | Atualizar quando |
|---|---|
| `docs/DATABASE.md` | Schema, RLS, functions, triggers |
| `docs/DOMAIN_MODEL.md` | Entidades, repositórios, invariantes, regras de negócio |
| `docs/DDD_STRUCTURE.md` | Estrutura de pastas, use cases, rotas, convenções |
| `docs/ARCHITECTURE.md` | Fluxos entre camadas, diagramas, padrões estruturais |
| `docs/API.md` | Server Actions (input, output, lógica, efeitos) |
| `docs/TECH_STACK.md` | Dependências, ferramentas, versões |
| `docs/DECISIONS.md` | Qualquer decisão técnica com trade-off deliberado |
| `docs/ROADMAP.md` | Status de features (concluído, iniciado, cancelado) |
| `docs/DEVELOPMENT_GUIDE.md` | Setup, env vars, deploy, scripts, troubleshooting |
| `docs/CONTENT_PIPELINE.md` | Como conteúdo é inserido no banco |
| `docs/SUPABASE_INTEGRATION.md` | Padrões Supabase (clientes, auth, RPC, erros) |
| `docs/GLOSSARY.md` | Novos termos ou conceitos no codebase |
| `docs/MAINTENANCE.md` | Regras de manutenção da própria documentação |
| `skills/002-architecture-rules.md` | Regras de camada, templates de código |
| `skills/003-ddd-guidelines.md` | Padrões DDD, criação de entidades/repos |
| `skills/004-content-pipeline.md` | Pipeline de conteúdo matemático |
| `skills/005-supabase-integration.md` | Integração Supabase para agentes |
| `skills/006-coding-standards.md` | Nomenclatura, TypeScript, comentários, Tailwind |
| `skills/007-future-agent-instructions.md` | Tasks comuns, FAQ, referência de arquivos |
