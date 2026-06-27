# Tech Stack — Matema

## Frontend

| Tecnologia | Versão | Uso | Justificativa |
|---|---|---|---|
| Next.js | 16 | Framework principal | App Router + RSC + Server Actions + Turbopack = full-stack sem API separada |
| React | 19 | UI | Server Components nativos |
| TypeScript | 5 (strict) | Linguagem | Type safety ponta-a-ponta |
| Supabase Realtime | latest | Tempo real | Usado no fluxo de Duelos 1v1 |
| Tailwind CSS | v4 | Estilização | Design system utilitário, sem CSS custom manual |
| KaTeX | latest | Renderização LaTeX | Mais rápido que MathJax, sem servidor |
| Zod | latest | Validação | Schemas runtime + inferência TypeScript |
| @supabase/ssr | latest | Auth SSR | Cookies HttpOnly para sessão segura |

## Backend / Infraestrutura

| Tecnologia | Uso | Justificativa |
|---|---|---|
| Supabase | Banco de dados + Auth | PostgreSQL gerenciado + RLS + Auth integrado |
| PostgreSQL | Banco relacional | Suporte a JSONB, funções, RLS por linha |
| Supabase Auth | Autenticação | Email/senha, OAuth pronto, integrado com RLS |
| Supabase Functions (SQL) | Operações atômicas | award_lesson_completion, purchase_item, apply_duel_ratings |

## Ferramentas de desenvolvimento

| Ferramenta | Uso |
|---|---|
| Turbopack | Build dev (Next.js built-in, mais rápido que Webpack) |
| ESLint | Linting (config Next.js padrão) |
| Vercel | Deploy e hosting |

## Bibliotecas de UI / UX

| Biblioteca | Uso |
|---|---|
| Web Audio API (nativa) | SFX sintetizados (click, acerto, erro) |
| Nunito (Google Fonts) | Fonte principal (body) |
| Orbitron (Google Fonts) | Fonte display (XP, nível, ELO) |

## Variáveis CSS customizadas (tema)

```css
--matema-primary   /* cor primária */
--matema-dark      /* fundo escuro */
--matema-muted     /* texto secundário */
--matema-border    /* bordas */
--matema-warm      /* destaque quente */
--matema-cream     /* fundo claro/creme */
```

## Path aliases (tsconfig)

```json
{
  "@/*": ["./src/*"]
}
```

Exemplos: `@/domain/user/entities/User`, `@/presentation/components/ui/Button`

## Scripts npm

```bash
npm run dev      # Turbopack dev server (localhost:3000)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

## Versões pinadas relevantes (package.json)

```json
{
  "next": "16.x",
  "react": "19.x",
  "tailwindcss": "^4.x",
  "@supabase/ssr": "^0.x",
  "zod": "^3.x",
  "katex": "^0.x"
}
```

> Consulte `math-journey-frontend/package.json` para versões exatas.
