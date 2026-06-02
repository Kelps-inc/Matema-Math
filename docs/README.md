# Matema — Documentação Técnica

Bem-vindo à documentação técnica completa do projeto **Matema** (Math Journey).  
Esta pasta contém tudo que um desenvolvedor ou agente de IA precisa para entender e continuar o desenvolvimento.

---

> ## ⚠️ Regra obrigatória de manutenção
>
> **Toda alteração no código deve ser acompanhada da atualização dos documentos correspondentes.**  
> Código alterado sem documentação atualizada = tarefa incompleta.
>
> Antes de declarar qualquer tarefa concluída, consulte **[MAINTENANCE.md](MAINTENANCE.md)** para saber exatamente quais documentos atualizar.  
> Agentes de IA: leia também **[skills/008-documentation-maintenance.md](../skills/008-documentation-maintenance.md)**.

---

## Índice de documentos

| Arquivo | Conteúdo |
|---|---|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Visão geral, propósito, público-alvo e features |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura geral, camadas, fluxo de dados |
| [DOMAIN_MODEL.md](DOMAIN_MODEL.md) | Entidades de domínio, invariantes, value objects |
| [DDD_STRUCTURE.md](DDD_STRUCTURE.md) | Estrutura DDD: pastas, convenções, responsabilidades |
| [TECH_STACK.md](TECH_STACK.md) | Todas as tecnologias, versões e justificativas |
| [DATABASE.md](DATABASE.md) | Schema completo, RLS, functions, triggers |
| [API.md](API.md) | Server Actions, endpoints, contratos de entrada/saída |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | Setup local, variáveis de ambiente, scripts |
| [ROADMAP.md](ROADMAP.md) | Features planejadas, prioridades e status |
| [DECISIONS.md](DECISIONS.md) | Decisões de arquitetura (ADRs) com justificativas |
| [GLOSSARY.md](GLOSSARY.md) | Glossário de termos do domínio e técnicos |
| [MAINTENANCE.md](MAINTENANCE.md) | **Contrato de manutenção contínua da documentação** |

## Skills para agentes de IA

A pasta [`../skills/`](../skills/) contém guias estruturados para que agentes de IA possam colaborar com o projeto de forma segura e coerente.

## Quick start

```bash
cd math-journey-frontend
npm install
# copie .env.local com credenciais Supabase
npm run dev  # http://localhost:3000
```

Veja [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) para instruções completas.
