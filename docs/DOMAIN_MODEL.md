# Domain Model — Matema

> **Manutenção:** Toda nova entidade, campo, invariante ou interface de repositório **deve** ser refletida aqui imediatamente. Consulte `docs/MAINTENANCE.md`.

Todas as entidades vivem em `src/domain/`. São classes ou tipos TypeScript puros — sem dependências de Supabase, Next.js ou React.

## Entidades

### User
**Arquivo**: `src/domain/user/entities/User.ts`

Representa o jogador autenticado.

```typescript
interface User {
  id: string                    // UUID (auth.users PK)
  email: string
  username: string              // único, lowercase
  displayName: string           // nome exibido
  avatarId: string              // 'default' ou referência
  level: number                 // calculado do XP
  xp: number                   // acumulado total
  coins: number                 // moeda do jogo
  streakDays: number            // dias consecutivos
  isAdmin: boolean
  // ELO
  eloTier: EloTier             // 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante' | 'mestre'
  eloDivision: number          // 1–4 (1 = mais alto); Mestre = 1
  eloLp: number                // League Points 0–99
  placementCompleted: boolean  // passou pelo placement test?
}
```

**Métodos calculados:**
- `xpToNextLevel(): number` — XP necessário para o próximo nível
- `xpForCurrentLevel(): number` — XP base do nível atual
- `levelProgressPercent(): number` — progresso 0–100% dentro do nível atual

**Fórmula de nível:**
```
level = Math.floor(Math.sqrt(xp / 50)) + 1
xp_for_level(n) = (n - 1)^2 * 50
```

**Constantes:**
```typescript
ELO_TIER_LABELS = { bronze: 'Bronze', prata: 'Prata', ... }
ELO_TIER_ICONS  = { bronze: '🥉', prata: '🥈', ... }
```

---

### Module
**Arquivo**: `src/domain/learning/entities/Module.ts`

Agrupa lições de um tema matemático.

```typescript
interface Module {
  id: string
  slug: string          // ex: 'numeros-e-operacoes'
  title: string
  description: string
  icon: string          // emoji, ex: '🔢'
  color: string         // hex, ex: '#D4845A'
  orderIndex: number    // ordem de exibição
  isFree: boolean       // acesso sem assinatura
  lessons: Lesson[]     // lições do módulo
}
```

---

### Lesson
**Arquivo**: `src/domain/learning/entities/Lesson.ts` (ou junto ao Module)

Uma lição dentro de um módulo.

```typescript
interface Lesson {
  id: string
  moduleId: string
  slug: string
  title: string
  description: string
  theory: string        // markdown/texto de teoria exibido antes dos exercícios
  orderIndex: number
  xpReward: number      // XP concedido ao completar
  coinReward: number    // moedas concedidas ao completar
  exercises: Exercise[]
}
```

---

### Exercise
**Arquivo**: `src/domain/learning/entities/Exercise.ts`

Uma questão dentro de uma lição.

```typescript
interface Exercise {
  id: string
  lessonId: string
  question: string          // texto (pode conter LaTeX: $...$)
  context?: string          // contexto opcional (enunciado longo)
  type: ExerciseType        // 'multiple_choice' | 'true_false' | 'numeric'
  options: string[]         // para multiple_choice (4 itens)
  correctAnswer: string
  explanation: string       // exibido após responder
  difficulty: Difficulty    // 'easy' | 'medium' | 'hard'
  orderIndex: number
  source?: string           // 'ENEM AAAA' ou 'Original Matema'
}
```

**Método:**
- `isCorrect(answer: string): boolean` — comparação case-insensitive com trim

> 🔒 **Anti-cheat:** `correctAnswer` **não é serializado para o cliente** nos modos de
> lição/objetivas/ENEM. A correção é feita no servidor (`app/actions/answers.ts` →
> `checkExerciseAnswerAction`/`checkPlacementAnswerAction`), que recebe `(id, answer)` e
> revela o veredito só após responder. Exceção: o modo **Simulado** ainda carrega o
> gabarito no cliente para feedback imediato, mas a pontuação é revalidada no servidor.
> Ver ADR-009 em `DECISIONS.md`.

---

### PlacementQuestion
Questão usada no placement test para determinar ELO inicial. Estrutura similar ao Exercise mas armazenada em tabela separada.

---

### Duel
Duelo 1v1 assíncrono entre dois jogadores. Persistido em `duels` (ver `DATABASE.md`); a lógica
vive em `app/actions/duelo.ts`. Tem rating próprio (`duel_rating`, default 1000), separado do ELO.

Estados: `pending` (aguardando oponente) → `active` (ambos entraram) → `completed` (ambos
responderam) | `cancelled`. O resultado credita rating de forma atômica via RPC
`apply_duel_ratings` (recálculo de acertos no servidor).

---

### Friendship
Relação de amizade/pedido entre dois usuários (`friendships`). Estados: `pending` / `accepted`
/ `blocked`. Invariante: não é possível adicionar a si mesmo (`CHECK requester_id != addressee_id`).

---

## Repositórios (interfaces)

### IUserRepository
```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>
  update(id: string, data: Partial<User>): Promise<void>
}
```

### ILearningRepository
```typescript
interface ILearningRepository {
  findAllModules(): Promise<Module[]>
  findModuleBySlug(slug: string): Promise<Module | null>
  findLessonWithExercises(lessonId: string): Promise<Lesson | null>
  findCompletedLessonIds(userId: string): Promise<string[]>
  findRankedLessonStats(userId: string): Promise<RankedStats>
}
```

### IProgressRepository
```typescript
interface LessonCompletionResult {
  newXp: number; newLevel: number; newCoins: number; leveledUp: boolean
}

interface IProgressRepository {
  completedLessonIds(userId: string): Promise<string[]>
  // A recompensa NÃO é passada pelo chamador — o RPC award_lesson_completion a deriva
  // de `lessons` (anti-cheat). Retorna o novo estado do perfil.
  completeLesson(userId: string, lessonId: string): Promise<LessonCompletionResult>
  recordAnswer(userId: string, exerciseId: string, answer: string, isCorrect: boolean): Promise<void>
}
```

## Invariantes de negócio

| Regra | Onde aplicada |
|---|---|
| XP e moedas nunca negativos | Constraint SQL + lógica domain |
| Level mínimo = 1 | Fórmula de nível |
| ELO LP: 0–99 (exceto Mestre) | Server action `saveRankedGameAction` |
| Bronze IV LP 0 = piso (não demove) | Server action |
| Placement test: exatamente 15 questões | PlacementPlayer component |
| Ranked early exit (< 2 respostas) = -2 LP por skip | Server action |
| Peso das dificuldades: easy×1, medium×1.5, hard×2 | Cálculo de score ranqueado |
| `isCorrect` sempre recalculado no servidor (nunca confiar no cliente) | `ranked.ts`, `elo.ts`, `answers.ts` |
| Bônus de tempo limitado (clamp de `timeMs` em [2s, 60s]) | `saveRankedGameAction` |
| Recompensa de lição derivada de `lessons`, zerada em refarm | RPC `award_lesson_completion` |
| Não pode adicionar a si mesmo como amigo | `CHECK` em `friendships` |
| Crédito de rating de duelo é atômico (RPC) | `apply_duel_ratings` |
