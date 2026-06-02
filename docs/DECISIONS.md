# Architectural Decision Records — Matema

> **Manutenção:** Toda decisão técnica com trade-off deliberado **deve** ser registrada aqui como um novo ADR numerado sequencialmente. Formato: consulte `docs/MAINTENANCE.md`. Último ADR: **ADR-008**.

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
