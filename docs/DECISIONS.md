# Architectural Decision Records — Matema

> **Manutenção:** Toda decisão técnica com trade-off deliberado **deve** ser registrada aqui como um novo ADR numerado sequencialmente. Formato: consulte `docs/MAINTENANCE.md`. Último ADR: **ADR-015**.

## ADR-001: Next.js App Router com Server Components

**Contexto:** Escolha do framework full-stack.

**Decisão:** Next.js 15 com App Router.

**Justificativa:**
- Server Components reduzem drasticamente o bundle JS enviado ao cliente
- Server Actions eliminam a necessidade de uma API REST separada
- Suporte nativo a streaming e Suspense
- Deploy simples no Vercel com zero config

**Trade-offs:**
- Mental model diferente de CSR puro
- Server Components não têm estado, precisam de Client Components para interatividade

---

## ADR-002: Supabase como backend

**Contexto:** Necessidade de banco de dados, autenticação e autorização.

**Decisão:** Supabase (PostgreSQL + Auth + RLS).

**Justificativa:**
- Auth completa sem servidor próprio (email, OAuth)
- RLS garante isolamento de dados por usuário no banco
- Functions SQL para operações atômicas (award_lesson_completion)
- Free tier generoso para MVP
- `@supabase/ssr` integra perfeitamente com Next.js App Router

**Trade-offs:**
- Vendor lock-in (mitigado pela camada de abstração DDD)
- Latência de cold start em serverless

---

## ADR-003: Domain-Driven Design (DDD)

**Contexto:** Estruturar o código para escalabilidade e testabilidade.

**Decisão:** DDD com 4 camadas: Domain, Application, Infrastructure, Presentation.

**Justificativa:**
- Isola lógica de negócio (entidades, use cases) de detalhes de implementação
- Facilita trocar Supabase por outro banco no futuro
- Facilita adicionar testes unitários nas entidades
- Código mais legível e navegável para novos devs

**Trade-offs:**
- Mais boilerplate que uma abordagem simples de chamadas diretas
- Curva de aprendizado inicial

---

## ADR-004: Server Actions em vez de API Routes

**Contexto:** Como expor mutações ao frontend.

**Decisão:** Server Actions (`'use server'`) para todas as mutações.

**Justificativa:**
- Type-safe de ponta a ponta (sem serialização manual)
- Colocalizados com o domínio que servem
- Validação Zod inline
- Revalidação de cache trivial via `revalidatePath`

**Trade-offs:**
- Não são consumíveis por clientes externos (mobile app futuro precisaria de API Routes)
- Modelo ainda relativamente novo (Next.js 13.4+)

---

## ADR-005: Avatares SVG procedurais

**Contexto:** Identidade visual dos jogadores.

**Decisão:** Avatar gerado via SVG puro em React, sem imagens externas.

**Justificativa:**
- Zero custo de armazenamento
- Combinações quase infinitas sem assets de imagem
- Escalável a qualquer tamanho sem perda de qualidade
- Customização em tempo real sem upload

**Trade-offs:**
- SVG complexo no bundle
- Limitações artísticas vs. sprites desenhados

---

## ADR-006: ELO inspirado em League of Legends

**Contexto:** Sistema de progressão ranqueada.

**Decisão:** Tiers (Bronze→Mestre) com divisões (IV–I) e LP (0–99).

**Justificativa:**
- Sistema reconhecível e familiar para o público-alvo (gamers)
- Cria metas claras de curto prazo (divisão) e longo prazo (tier)
- Piso em Bronze IV evita frustração por demoção infinita

**Trade-offs:**
- Mais complexo que um simples ELO numérico
- LP drift pode precisar de calibração com mais dados de jogo

---

## ADR-007: Web Audio API para SFX

**Contexto:** Feedback sonoro nos exercícios.

**Decisão:** SFX sintetizados via Web Audio API sem arquivos de áudio.

**Justificativa:**
- Zero assets de áudio para hospedar
- Sons responsivos e customizáveis
- Funciona offline

**Trade-offs:**
- Sons sintéticos podem parecer artificiais
- Complexidade de implementação maior que `<audio>` tag
- Requer inicialização após interação do usuário (política do browser)

---

## ADR-008: Tailwind CSS v4

**Contexto:** Estilização da UI.

**Decisão:** Tailwind CSS v4 com variáveis CSS customizadas.

**Justificativa:**
- Classes utilitárias aceleram desenvolvimento
- v4 com engine Rust é significativamente mais rápido
- CSS vars permitem theming (claro/escuro) sem duplicar classes

**Trade-offs:**
- HTML verboso com muitas classes
- v4 ainda em evolução (algumas APIs mudaram em relação à v3)

---

## ADR-009: Recompensa e correção sempre recalculadas no servidor (anti-cheat)

**Contexto:** As Server Actions `completeLessonAction` e `saveRankedGameAction` recebiam do
cliente os valores de XP/moedas (`xpReward`/`coinReward`) e a flag `isCorrect` de cada
resposta, e os repassavam direto para o banco (RPC `award_lesson_completion` / `update` de
`user_profiles`). Como o `correct_answer` também é enviado ao cliente, qualquer usuário
podia forjar a requisição (DevTools/curl) e creditar XP, moedas e LP arbitrários.

**Decisão:** O servidor **ignora** qualquer recompensa/correção vinda do cliente:
- A recompensa é lida da tabela `lessons` (`xp_reward`, `coin_reward`) dentro da action.
- `isCorrect` é recalculado comparando `answer` com `exercises.correct_answer`
  (mesma normalização `trim().toLowerCase()` usada na UI), descartando `exerciseId`
  desconhecido ou que não pertença à lição.
- Os campos do cliente continuam aceitos no schema apenas por compatibilidade, mas não
  têm efeito.

**Justificativa:**
- Regra inegociável: nunca confiar em dados do cliente para mutações sensíveis.
- Mantém o contrato das actions estável (a UI não precisou mudar).

**Trade-offs / pendências conhecidas (defense-in-depth futura):**
- ~~`exercises.correct_answer` ainda é enviado ao cliente (vazamento de gabarito).~~
- ~~`timeMs` na ranqueada ainda vem do cliente (peso de 5% no score) — impacto baixo.~~
- ~~O RPC `award_lesson_completion` ainda credita XP a cada chamada, permitindo refarm ao
  refazer a mesma lição; e ainda aceita `p_xp/p_coins` do chamador.~~

**Atualização (2026-06-15) — os três endurecimentos acima foram resolvidos:**

1. **Gabarito não vai mais ao cliente.** `exercises.correct_answer` /
   `placement_questions.correct_answer` deixaram de ser serializados nos DTOs e nas
   queries das páginas (`licao/[lessonId]`, `ranqueada/jogar/[mode]`,
   `ranqueada/placement`). A validação passou para Server Actions em
   `src/app/actions/answers.ts` (`checkExerciseAnswerAction` /
   `checkPlacementAnswerAction`), que recebem `(id, answer)`, comparam contra o gabarito
   no servidor (mesma normalização `trim().toLowerCase()`) e só então **revelam** o
   veredito + a resposta certa. Os players (`ExercisePlayer`, `RankedPlayer`,
   `PlacementPlayer`) chamam essa action ao confirmar a resposta e usam o retorno para o
   feedback "Correto!/Quase lá!" e o destaque da alternativa correta. A UX de feedback
   imediato é preservada (um único round-trip por questão). `savePlacementAction` também
   passou a recalcular `isCorrect` no servidor.

2. **RPC `award_lesson_completion` endurecido** (migration
   `002_harden_lesson_rewards.sql`). Nova assinatura `(p_user_id, p_lesson_id)` — não
   aceita mais `p_xp/p_coins`. A recompensa é lida de `lessons.xp_reward/coin_reward`
   dentro do RPC; se a lição já estiver em `user_lesson_progress`, a recompensa é
   **zerada** (anti-refarm). O registro em `user_lesson_progress` passou a ser feito
   dentro do RPC (atômico com o crédito de XP), eliminando o upsert separado do
   repositório. `SupabaseProgressRepository`, `CompleteLessonUseCase`,
   `IProgressRepository` e `completeLessonAction` foram ajustados para a nova assinatura.

3. **`timeMs` da ranqueada limitado.** Como não há medição confiável no servidor sem um
   round-trip por questão e o bônus de velocidade vale só 5% do score, optou-se por
   **limitar o bônus**: em `saveRankedGameAction` cada `timeMs` é fixado em
   `[2000ms, 60000ms]` antes do cálculo, de modo que forjar tempos baixíssimos (ou
   inválidos) não infla o `timeBonus` além do teto.

---

## ADR-010: Otimização de assets e metadados (favicon/PWA)

**Contexto:** `public/` continha imagens enormes servidas cruas — `nav-texture.jpg` (9,6 MB,
5000px) e `header-bg.png` (1,6 MB) usadas como `background` CSS (não passam pelo
`next/image`), além de logos PNG de ~1 MB. Faltavam ícones modernos e manifest.

**Decisão:**
- Converter os assets para **WebP** redimensionado e atualizar as referências:
  `nav-texture.webp` (107 KB), `header-bg.webp` (41 KB), `matema-logo.webp` /
  `matema-logo-landing.webp` (~37 KB cada). Originais removidos.
- Adicionar `app/icon.png`, `app/apple-icon.png` (convenções do App Router),
  `app/manifest.ts`, `og-image.webp` e `metadataBase`/`openGraph`/`twitter`/`viewport`
  no `layout.tsx`.
- `next.config.ts`: `images.formats` AVIF/WebP, `compiler.removeConsole` em produção,
  `poweredByHeader: false`.

**Justificativa:** redução de ~13 MB para ~260 KB nos assets críticos do above-the-fold;
LCP/transfer muito menores; SEO/compartilhamento e instalabilidade PWA básicos.

**Trade-offs:**
- WebP em `background` CSS não tem fallback automático (suporte universal nos browsers
  modernos alvo).

---

## ADR-011: Reconciliação do histórico de migrations (CLI vs. remoto)

**Contexto:** o repo versiona migrations **numeradas** (`001`–`004`) em
`math-journey-backend/supabase/migrations/`, mas o banco remoto tinha um histórico
**com timestamps** (15 migrations aplicadas direto via dashboard/MCP — Duelo, Simulado,
Amigos etc.). As duas histórias divergiam: `supabase db push`/`db pull` se recusavam a
rodar, e nenhuma das numeradas estava registrada no remoto.

**Decisão:** consolidar tudo no esquema numerado do repo (fonte canônica), via
`supabase migration repair`:
1. `repair --status applied 001 003 004` — schema já existia no remoto; marcadas sem reexecutar.
2. `repair --status reverted <15 timestamps>` — removidas só do **tracking** (schema intacto).
3. `supabase db push --include-all` — aplicou apenas `002` (idempotente).

Resultado: `001`–`004` alinhadas local ↔ remoto. O projeto fica gerenciável por
`supabase db push` daqui para frente (rodar a partir de `math-journey-backend/`).

**Trade-off / lacuna conhecida:** objetos que existiam só nas 15 migrations com timestamp
e que **não** estão nas numeradas — notadamente o RPC **`apply_duel_ratings`** — não são
reproduzíveis a partir do repo. **Próximo passo:** materializar esses objetos numa migration
`005_*` (ou rodar `supabase db pull` agora que as histórias estão alinhadas) para fechar a
lacuna de reprodutibilidade.

---

## ADR-012: Upgrade para Next.js 16 + React 19

**Contexto:** o projeto nasceu em Next.js 15 (ver ADR-001). A base evoluiu para
**Next.js 16.2.6 + React 19.2.4** com Turbopack no dev.

**Decisão:** adotar Next.js 16 (App Router + RSC + Server Actions + Turbopack) como versão
corrente. ADR-001 permanece como registro histórico da escolha original.

**Impacto na doc:** `TECH_STACK.md`, `ARCHITECTURE.md` e `skills/001-project-context.md`
atualizados para refletir Next 16/React 19. O `AGENTS.md` do frontend já alerta que esta
versão tem breaking changes — **leia `node_modules/next/dist/docs/` antes de codar**.

---

## ADR-013: Versão Pro com AbacatePay (Simulado ENEM gated)

**Contexto:** monetizar o Matema. Os modos **Simulado ENEM** e **Duelo** são exclusivos de
assinantes **Pro**; admins têm acesso sem pagar.

**Decisão:**
- **Gateway: AbacatePay.** Três caminhos de aquisição: **trial de 7 dias** (uma vez, RPC
  `start_pro_trial`), **PIX avulso** (checkout `/v2/checkouts/create`, libera 30 dias) e
  **assinatura recorrente no cartão** (`/v2/subscriptions/create`). A API de assinatura só
  aceita CARD; por isso o PIX entra como cobrança avulsa renovável.
- **Fonte da verdade do acesso = `user_profiles.pro_until`.** `hasProAccess()` no domínio =
  `isAdmin || pro_until > now()`. Gates no server: **Simulado** em `jogar/[mode]/page.tsx` e
  **Duelo** em `duelo/layout.tsx` (ambos redirecionam para `/pro`), além do card de modos e
  das actions de criação de duelo (`createDuelAction`/`joinDuelByCodeAction`).
- **Concessão de acesso só pelo servidor confiável.** O acesso pago é liberado pelo **webhook**
  `/api/abacatepay/webhook` (eventos `checkout.completed`, `subscription.completed|renewed|
  cancelled`), validado por `webhookSecret` na query + HMAC opcional. O webhook usa
  **service role** (`createServiceClient`) — exceção justificada à regra "sem service_role":
  é contexto de servidor sem sessão de usuário e a chave nunca chega ao cliente.
- **Mapeamento usuário↔pagamento:** `externalId` e `metadata.userId` = `user.id` no create,
  lidos de volta no webhook.

**Trade-offs / riscos conhecidos:**
- A policy RLS de `user_profiles` permite `UPDATE` de qualquer coluna pelo próprio usuário —
  logo `pro_until` (e `xp`/`elo_*`) só são escritos por RPC `security definer`/webhook, nunca
  por update direto do cliente. **TODO de hardening:** restringir colunas sensíveis na policy.
- Expiração é "lazy" (checada em `pro_until > now()`); não há job de varredura — o status só
  muda quando o webhook renova/cancela ou o tempo passa.
- Preço/produto vivem no painel do AbacatePay (`ABACATEPAY_PRO_PRODUCT_ID`), fora do código.

## ADR-014: Plano Turma (Sala de Aula) — PIX de valor customizado + códigos

**Contexto:** além do Pro individual (ADR-013), professores/coordenadores querem licenciar o
Pro para uma turma inteira com desconto por volume. O preço é dinâmico (`14,90 × N × fator × M`),
mas o checkout/assinatura do AbacatePay **só aceita o produto pré-cadastrado** (R$ 14,90 fixo) —
não dá para passar um valor arbitrário por ali.

**Decisão:**
- **Cobrança via PIX "transparent" (`/v2/transparents/create`)** — o único endpoint do AbacatePay
  que aceita `amount` arbitrário (em centavos). Logo o Plano Turma é **PIX avulso** (sem cartão
  recorrente), com duração escolhida pelo responsável (1/3/6/12 meses) paga num PIX só.
- **Desconto por volume:** 20% off até 49 alunos; 25% off a partir de 50. A regra vive em
  `domain/pro/turmaPricing.ts` (pura) e espelhada no comentário da migration `006`. O preço é
  **calculado no servidor** (a Server Action ignora qualquer valor vindo do cliente).
- **Entrega por códigos:** ao confirmar o pagamento, o **webhook** chama
  `fulfill_turma_order` (idempotente) que gera **N códigos únicos** (`TRM-XXXXXXXX`). Cada aluno
  resgata o seu (`redeem_turma_code`) e ganha `pro_until = now() + M meses`. Escolhido em vez de
  lista de e-mails por ser mais simples e não exigir cadastro prévio dos alunos.
- **Status por polling do nosso DB**, não do AbacatePay: o cliente consulta `turma_orders.status`
  (gravado pelo webhook). Evita depender de endpoint de "check" do gateway e mantém o webhook
  como única fonte da verdade do pagamento (mesma filosofia do ADR-013).

**Trade-offs / riscos conhecidos:**
- Sem renovação automática (PIX não recorre) — ao fim do período o responsável compra de novo.
- Nomes de evento do webhook para PIX transparent não estão 100% documentados; o handler aceita
  `status PAID` ou `billing.paid`/`pix.paid`/`pixQrCode.paid` e discrimina por `metadata.kind`.
- Um aluno não pode ocupar duas vagas da mesma turma (checado no RPC), mas pode resgatar códigos
  de turmas diferentes (acumula meses via `greatest`).

## ADR-015: Chat (DM entre amigos) + presença online — leve, sem Realtime

**Contexto:** dar um canal social no jogo (chat) e indicar quem está online, sem peso de
infra (Realtime/WebSocket) nem custo de armazenamento crescente.

**Decisão:**
- **DM 1-a-1 apenas entre amigos.** A RLS de `chat_messages` (migration `007`) só permite INSERT
  se existir `friendship` `accepted` entre remetente e destinatário; SELECT só para os dois lados.
- **Polling, não Realtime.** O widget flutuante global faz polling: lista a cada 15s (aberto) /
  60s (fechado), conversa aberta a cada 5s. Mais simples e barato que canais Realtime; suficiente
  para a escala atual.
- **Histórico expira em 7 dias.** Garantia de UX = filtro `created_at > now()-7d` em toda leitura.
  Limpeza de storage = `purge_old_chat_messages()` agendada por **pg_cron** (best-effort; se
  indisponível, o filtro de leitura já basta).
- **Presença via `last_active_at`** (sem coluna/tabela nova). `PresenceHeartbeat` grava a cada 60s;
  `isOnline()` (`domain/social/presence.ts`) = ativo nos últimos 2 min. Header mostra "(N)" de
  amigos online e a lista de amigos ganha bolinha verde.

**Trade-offs / riscos conhecidos:**
- Latência de até ~5s nas mensagens (polling) — aceitável; evoluível para Realtime se necessário.
- Heartbeat gera 1 UPDATE/min por usuário ativo (barato; só quando a aba está visível).
- Sem moderação/– bloqueio ainda; como é restrito a amigos, o risco é baixo. Bloqueio fica para depois.
