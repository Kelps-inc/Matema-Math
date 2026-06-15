# Skill 007 — Instructions for Future AI Agents

Este documento orienta agentes de IA que irão continuar o desenvolvimento do Matema.

## Protocolo de trabalho obrigatório

### Antes de qualquer tarefa

1. **Leia** `skills/001-project-context.md` para entender o projeto
2. **Leia** o documento relevante em `docs/` para a área que vai mexer
3. **Explore** os arquivos reais no codebase — não assuma estrutura sem verificar
4. **Verifique** se há migrations pendentes antes de sugerir schema changes
5. **Entenda a memória do projeto** lendo `skills/009-vault-bridge.md`: a fonte canônica é `docs/`+`skills/`; há um vault Obsidian opcional só para agentes do dono. Se você não tem acesso ao vault, isso é normal — não tente acessá-lo.

### Ao finalizar qualquer tarefa

6. **Execute o checklist de documentação** em `skills/008-documentation-maintenance.md`
7. **Atualize todos os documentos indicados** — uma tarefa sem docs atualizados não está concluída
8. **Registre decisões técnicas** em `docs/DECISIONS.md` se tomou alguma escolha não-óbvia
9. **Se você tem acesso ao vault Obsidian**, espelhe nele as mudanças arquiteturais depois de atualizar `docs/`+`skills/` (ver `skills/009-vault-bridge.md`)

## Princípios inegociáveis

| Princípio | Por quê |
|---|---|
| Nunca Supabase em Client Components | Expõe queries ao cliente, viola DDD |
| Validação Zod em toda Server Action | Dados externos nunca são confiáveis |
| `getUser()` não `getSession()` | getSession() não valida com servidor |
| RPC para operações atômicas | Updates sequenciais criam inconsistência |
| Domain layer sem imports externos | Testabilidade e portabilidade |
| `revalidatePath` após mutações | Sem isso, UI fica desatualizada |

## Tasks comuns e onde mexer

### Adicionar exercício/lição
→ `math-journey-backend/supabase/seed/001_content.sql`
→ Execute no Supabase SQL Editor
→ Veja `skills/004-content-pipeline.md`

### Mudar lógica de ELO/LP
→ `math-journey-frontend/src/app/actions/ranked.ts`
→ Cuidado com promoção/demoção e o piso em Bronze IV LP 0

### Mudar lógica de XP/nível
→ Fórmula em `src/domain/user/entities/User.ts`
→ Function SQL `xp_to_level` no Supabase (manter sincronizados!)

### Adicionar campo ao avatar
→ `src/presentation/components/avatar/AvatarConfig.ts` (constantes)
→ `src/presentation/components/avatar/Avatar.tsx` (renderização SVG)
→ `src/presentation/components/avatar/AvatarEditor.tsx` (UI de edição)
→ `src/app/actions/avatar.ts` (Server Action)
→ `src/infrastructure/repositories/SupabaseUserRepository.ts`
→ SQL: `ALTER TABLE user_avatar_config ADD COLUMN ...`

### Adicionar item à loja
→ SQL: INSERT em `shop_items`
→ Verifique se UI em `ShopGrid.tsx` precisa de tratamento especial para nova categoria

### Adicionar nova página
→ Crie `src/app/nova-rota/page.tsx` (RSC)
→ Siga padrão de auth + repositório + props para Client Components

### Implementar streaks
→ Lógica deve ir em `src/app/actions/progress.ts` (`completeLessonAction`)
→ Compare `last_active_at` do perfil com data atual
→ Incrementa `streak_days` se ontem, reseta se gap > 1 dia
→ Update `last_active_at` sempre
→ Colunas já existem em `user_profiles`

### Implementar leaderboard completo
→ Query em `user_profiles` ordenada por `elo_tier`, `elo_division`, `elo_lp`
→ Ordenação: tier DESC, division ASC (IV < I), lp DESC
→ Exibir em `/ranqueada` (já existe a página)

## O que NÃO fazer

- **Não** use `supabase.auth.getSession()` — use `getUser()`
- **Não** faça updates diretos em XP/moedas fora do RPC `award_lesson_completion`
- **Não** remova validação Zod de Server Actions
- **Não** coloque lógica de negócio em componentes React
- **Não** crie API Routes para substituir Server Actions (a menos que necessário para mobile)
- **Não** commite `.env.local` ou qualquer chave
- **Não** use `service_role` key no frontend — apenas em Edge Functions se necessário

## Perguntas frequentes para agentes

**Q: Onde fica a lógica de cálculo de ELO?**  
A: Toda em `src/app/actions/ranked.ts` → função `saveRankedGameAction`

**Q: Como renderizo matemática em um novo componente?**  
A: Importe `MathText` de `@/presentation/components/ui/MathText` e use `<MathText text="$\frac{a}{b}$" />`

**Q: Como sei se o usuário está autenticado em um Server Component?**  
A: `const { data: { user } } = await supabase.auth.getUser()` — se `user` é null, não autenticado

**Q: Como adiciono áudio a uma nova interação?**  
A: Use o hook/context do `AudioManager` ou importe `playSound` de `@/presentation/lib/audio`

**Q: Qual é o piso de ELO?**  
A: Bronze IV com 0 LP — nenhuma perda de LP pode causar demoção abaixo disso

**Q: Como funciona o placement test?**  
A: 15 questões da tabela `placement_questions`, score determina tier inicial via tabela em `savePlacementAction`

## Comunicação com o desenvolvedor

- Quando sugerir mudanças de schema, mostre o SQL exato
- Quando não tiver certeza de uma invariante de negócio, pergunte antes de implementar
- Documente decisões técnicas não-óbvias em `docs/DECISIONS.md`
- Se encontrar um bug, descreva o comportamento esperado vs. atual antes de corrigir

## Referência rápida de arquivos

| O que fazer | Arquivo |
|---|---|
| Lógica ELO/LP | `src/app/actions/ranked.ts` |
| Lógica placement | `src/app/actions/elo.ts` |
| Lição completa | `src/app/actions/progress.ts` |
| Compra na loja | `src/app/actions/shop.ts` |
| Salvar avatar | `src/app/actions/avatar.ts` |
| Reset/delete conta | `src/app/actions/account.ts` |
| Buscar módulos | `src/infrastructure/repositories/SupabaseLearningRepository.ts` |
| Perfil do usuário | `src/infrastructure/repositories/SupabaseUserRepository.ts` |
| Player de lição | `src/presentation/components/game/ExercisePlayer.tsx` |
| Player ranqueado | `src/presentation/components/game/RankedPlayer.tsx` |
| Placement player | `src/presentation/components/game/PlacementPlayer.tsx` |
| Avatar SVG | `src/presentation/components/avatar/Avatar.tsx` |
| SFX/Áudio | `src/presentation/lib/audio.ts` |
| Schema banco | `math-journey-backend/supabase/migrations/001_initial_schema.sql` |
| Seed conteúdo | `math-journey-backend/supabase/seed/001_content.sql` |
