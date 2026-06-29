# Roadmap — Matema

> **Manutenção:** Atualize este arquivo sempre que uma feature mudar de status (concluída, iniciada, cancelada) ou quando uma nova feature for planejada. Consulte `docs/MAINTENANCE.md`.

## Status atual (junho 2026)

### ✅ Concluído

- Autenticação (signup, login, logout)
- Sistema de módulos e lições com exercícios
- Player de exercícios com intro → respostas → feedback → conclusão
- 3 tipos de exercício: múltipla escolha, V/F, numérico
- Renderização LaTeX via KaTeX
- Sistema de XP e níveis (fórmula exponencial)
- Sistema de moedas
- Placement test (15 questões → ELO inicial)
- Modo ranqueado com LP e promoção/rebaixamento
- 6 tiers ELO: Bronze → Prata → Ouro → Platina → Diamante → Mestre
- Avatar procedural customizável (SVG)
- Loja de cosméticos com moedas
- Dashboard com progresso, ELO, estatísticas
- Modo claro/escuro
- Áudio ambiente (chuva) + SFX sintetizados
- Mobile-first responsivo
- Questões ENEM etiquetadas (fonte: ENEM AAAA)
- Modo "Estilo ENEM" desbloqueável
- **Simulado ENEM** (45 questões, sessão salva/retomável — `simulado_sessions`)
- **Duelos 1v1 assíncronos** (convite por código, rating próprio `duel_rating`, RPC `apply_duel_ratings`)
- **Amigos** (busca de usuários, pedidos/aceite — `friendships`)
- Validação de respostas server-side + recompensa anti-cheat (migration `002`)
- PWA (manifest + ícones) e otimização de imagens (WebP)
- **Versão Pro** (AbacatePay): assinatura no cartão + PIX avulso + trial de 7 dias; libera o Simulado ENEM **e o Duelo** (admins têm bypass)
- **Plano Turma** (AbacatePay): responsável compra N vagas Pro por M meses via PIX de valor customizado (20% off ≤49 alunos, 25% off ≥50); gera N códigos que os alunos resgatam — ver ADR-014
- **Gerenciar assinatura** em Configurações: status do plano + cancelamento (`cancelProSubscriptionAction`). Admin tem o modo "ver como não-assinante" (`?preview=free` em `/configuracoes` e `/pro`) para conferir o funil de compra como um usuário grátis
- Admin: preview de questões

---

## 🔄 Em progresso / Planejado

### Alta prioridade

| Feature | Descrição | Status |
|---|---|---|
| **Streaks** | Contagem de dias consecutivos, recompensa visual | Schema pronto, lógica pendente |
| **Leaderboard** | Ranking global por ELO tier | Parcial (tier exibido, ranking completo pendente) |
| **Mais conteúdo** | Mais lições e exercícios nos 4 módulos | Contínuo |
| **Questões ENEM** | Banco maior de questões estilo ENEM | Contínuo |

### Média prioridade

| Feature | Descrição |
|---|---|
| **Conquistas/Badges** | Sistema de badges (schema previsto) |
| **Notificações** | Push/email para streak, ranking |
| **Perfil público** | Página de perfil visitável |
| **Histórico de partidas** | Lista de partidas ranqueadas anteriores |

### Baixa prioridade / Futuro

| Feature | Descrição |
|---|---|
| **Duelos em tempo real** | Hoje os Duelos 1v1 são assíncronos; evoluir para partida síncrona via Supabase Realtime |
| **AI Tutor** | Explicações personalizadas via IA |
| **Planos de estudo** | Cronograma personalizado por data de prova |
| **Modo sala de aula** | Professor cria turmas, acompanha progresso |
| **Temas visuais** | Mais opções além de claro/escuro |
| **Multiplayer cooperativo** | Resolver questões em dupla |

---

## Decisões de produto pendentes

- ~~Modelo de monetização~~ → **definido:** freemium com Pro (Simulado ENEM gated). Falta definir preço final e o que mais o Pro libera no futuro.
- Quais módulos serão `is_free = false`
- Política de reset de ELO (temporada?)
- Limite de partidas ranqueadas por dia
