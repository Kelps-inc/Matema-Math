# Architectural Decision Records — Matema

> **Manutenção:** Toda decisão técnica com trade-off deliberado **deve** ser registrada aqui como um novo ADR numerado sequencialmente. Formato: consulte `docs/MAINTENANCE.md`. Último ADR: **ADR-009**.

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
