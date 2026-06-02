# Documentation Maintenance Contract — Matema

> **Este é um documento normativo.**  
> Toda alteração no projeto — feita por humano ou agente de IA — **deve** ser acompanhada da atualização dos documentos listados aqui. Documentação desatualizada é tão prejudicial quanto código quebrado.

---

## Regra fundamental

**Nenhuma alteração está completa até que a documentação correspondente seja atualizada.**

Se você (humano ou agente) fez uma mudança no código e não atualizou a documentação relevante, **a tarefa não está concluída**.

---

## Tabela de gatilhos: o que atualizar quando

Use esta tabela toda vez que finalizar uma mudança. Identifique o tipo de alteração e atualize os documentos indicados.

| Tipo de alteração | Documentos obrigatórios | Documentos opcionais |
|---|---|---|
| Nova tabela ou coluna no banco | `docs/DATABASE.md` | `docs/DOMAIN_MODEL.md` (se afetar entidade) |
| Remoção ou renomeação de coluna | `docs/DATABASE.md` | `docs/API.md` (se afetar Server Actions) |
| Nova function SQL ou trigger | `docs/DATABASE.md` | `docs/API.md` |
| Mudança em RLS policy | `docs/DATABASE.md` | — |
| Nova entidade de domínio | `docs/DOMAIN_MODEL.md` | `docs/DDD_STRUCTURE.md` |
| Novo repositório (interface ou implementação) | `docs/DOMAIN_MODEL.md`, `docs/DDD_STRUCTURE.md` | — |
| Novo use case | `docs/DDD_STRUCTURE.md` | `docs/ARCHITECTURE.md` |
| Nova Server Action | `docs/API.md` | `skills/007-future-agent-instructions.md` (tabela de referência) |
| Alteração em contrato de Server Action (input/output) | `docs/API.md` | — |
| Nova rota Next.js | `docs/DDD_STRUCTURE.md` | `docs/API.md` |
| Nova tecnologia ou biblioteca adicionada | `docs/TECH_STACK.md` | `docs/DECISIONS.md` (se foi decisão deliberada) |
| Remoção de tecnologia ou biblioteca | `docs/TECH_STACK.md` | `docs/DECISIONS.md` |
| Mudança na fórmula de XP/nível | `docs/DOMAIN_MODEL.md`, `docs/API.md` | `docs/PROJECT_OVERVIEW.md` |
| Mudança na lógica de ELO/LP | `docs/API.md`, `docs/DOMAIN_MODEL.md` | `docs/PROJECT_OVERVIEW.md` |
| Novo módulo ou lição de conteúdo | `docs/FILE_INGESTION_PIPELINE.md` | `docs/PROJECT_OVERVIEW.md` |
| Mudança no pipeline de ingestão de conteúdo | `docs/FILE_INGESTION_PIPELINE.md` | `skills/004-ingestion-pipeline.md` |
| Mudança nos padrões de integração Supabase | `docs/KGET_INTEGRATION.md` | `skills/005-kget-integration.md` |
| Mudança na arquitetura de camadas | `docs/ARCHITECTURE.md`, `docs/DDD_STRUCTURE.md` | `skills/002-architecture-rules.md`, `skills/003-ddd-guidelines.md` |
| Nova decisão técnica relevante (escolha de lib, padrão, abordagem) | `docs/DECISIONS.md` | — |
| Feature concluída ou iniciada | `docs/ROADMAP.md` | `docs/PROJECT_OVERVIEW.md` |
| Nova variável de ambiente | `docs/DEVELOPMENT_GUIDE.md` | `docs/KGET_INTEGRATION.md` |
| Mudança no processo de setup/deploy | `docs/DEVELOPMENT_GUIDE.md` | — |
| Novo termo de domínio introduzido no código | `docs/GLOSSARY.md` | — |
| Mudança nos padrões de código | `skills/006-coding-standards.md` | `skills/002-architecture-rules.md` |
| Nova tarefa comum adicionada ao projeto | `skills/007-future-agent-instructions.md` | — |

---

## Checklist obrigatório ao final de toda tarefa

Copie e execute este checklist mentalmente (ou literalmente) antes de declarar uma tarefa concluída:

```
[ ] Adicionei ou modifiquei tabela/coluna/function/trigger no banco?
    → Atualizar: docs/DATABASE.md

[ ] Adicionei ou modifiquei entidade de domínio?
    → Atualizar: docs/DOMAIN_MODEL.md

[ ] Adicionei ou modifiquei Server Action (input, output, lógica)?
    → Atualizar: docs/API.md

[ ] Adicionei nova rota, use case, repositório ou camada DDD?
    → Atualizar: docs/DDD_STRUCTURE.md

[ ] Adicionei ou removi dependência (npm, lib, serviço)?
    → Atualizar: docs/TECH_STACK.md

[ ] Tomei uma decisão técnica não-óbvia?
    → Registrar em: docs/DECISIONS.md

[ ] Mudei o status de uma feature (concluída, iniciada, cancelada)?
    → Atualizar: docs/ROADMAP.md

[ ] Introduzi novo conceito, termo ou abreviação no código?
    → Atualizar: docs/GLOSSARY.md

[ ] Mudei como conteúdo (lições/exercícios) é inserido?
    → Atualizar: docs/FILE_INGESTION_PIPELINE.md e skills/004-ingestion-pipeline.md

[ ] Mudei padrões de integração com Supabase?
    → Atualizar: docs/KGET_INTEGRATION.md e skills/005-kget-integration.md

[ ] Mudei como a arquitetura funciona?
    → Atualizar: docs/ARCHITECTURE.md e skills/002-architecture-rules.md

[ ] Mudei padrões de codificação (nomenclatura, estrutura, convenção)?
    → Atualizar: skills/006-coding-standards.md

[ ] Adicionei nova tarefa comum recorrente no projeto?
    → Atualizar: skills/007-future-agent-instructions.md (seção "Tasks comuns")
```

---

## Como atualizar corretamente

### Regras de escrita

1. **Seja específico.** Documente o comportamento real, não o intencionado.
2. **Mantenha o estilo do arquivo.** Se o documento usa tabelas, use tabelas. Se usa exemplos de código, adicione um.
3. **Remova o que está errado.** Documentação errada é pior que ausente. Se algo mudou, apague a versão antiga.
4. **Não adicione especulação.** Se não sabe como algo funciona, não escreva. Investigue primeiro.
5. **Use o presente.** Escreva "a função retorna X", não "a função vai retornar X".

### Onde registrar decisões (`docs/DECISIONS.md`)

Sempre que você escolher uma abordagem em vez de outra por um motivo não-óbvio, adicione um ADR com este formato:

```markdown
## ADR-NNN: Título curto da decisão

**Contexto:** Qual problema você estava resolvendo.

**Decisão:** O que foi escolhido.

**Justificativa:** Por que essa opção foi escolhida.

**Trade-offs:** O que foi sacrificado ou aceito como consequência.
```

O número deve ser sequencial. Consulte o último ADR existente para saber qual usar.

### Como atualizar o ROADMAP (`docs/ROADMAP.md`)

- Feature concluída: mova de "Planejado" para "Concluído" com ✅
- Feature iniciada: adicione "(em andamento)" ao lado
- Feature cancelada: remova ou adicione "(cancelado)" com justificativa
- Nova feature planejada: adicione na seção de prioridade adequada

---

## Responsabilidades

### Para agentes de IA

- **Antes de começar:** leia os docs relevantes para entender o estado atual
- **Durante a implementação:** anote o que mudou
- **Ao finalizar:** execute o checklist acima e atualize os docs necessários
- **Se não sabe onde documentar:** pergunte ao desenvolvedor antes de omitir

### Para desenvolvedores humanos

- Trate a documentação como parte do código — faça commit junto
- Revise se a documentação foi atualizada antes de fazer merge
- Se encontrar documentação desatualizada, corrija-a imediatamente (não "depois")

---

## Exceções permitidas

Você **não precisa** atualizar a documentação quando:

- A mudança é cosmética/visual sem impacto em comportamento, API ou estrutura
- É uma correção de typo ou formatação no próprio código
- É uma mudança de conteúdo matemático (exercício/lição) sem alterar o pipeline — isso já está documentado
- É uma refatoração interna que não muda contratos públicos (interfaces, Server Actions, banco)

Em caso de dúvida: **documente**. O custo de atualizar documentação desnecessariamente é baixo. O custo de ter documentação errada é alto.

---

## Versionamento desta documentação

Toda atualização significativa nos docs deve ser incluída no mesmo commit ou PR que originou a mudança no código. A mensagem de commit deve mencionar explicitamente quando documentação foi atualizada:

```
feat(ranked): add early-exit penalty for skipped questions

Updates docs/API.md and docs/DOMAIN_MODEL.md to reflect
the new -2 LP per skip rule.
```
