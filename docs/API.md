# API — Matema

> **Manutenção:** Toda nova Server Action, mudança de input/output ou alteração de lógica **deve** ser documentada aqui imediatamente. Consulte `docs/MAINTENANCE.md`.

Matema não tem uma REST API tradicional. Todas as mutações são **Server Actions** Next.js (`'use server'`). Leituras são feitas via **Server Components** acessando repositórios diretamente.

## Server Actions

Localização: `math-journey-frontend/src/app/actions/`

---

### `auth.ts`

#### `signUp(formData: FormData)`
Cria conta e faz login automático.

**Input (FormData):**
```
email: string
password: string
username: string
displayName: string
```

**Validação Zod:**
- email: válido
- password: mínimo 6 caracteres
- username: 3–20 chars, apenas letras/números/underscore
- displayName: 2–30 chars

**Output:**
```typescript
{ error: string }  // em caso de falha
// redirect para /dashboard em caso de sucesso
```

---

#### `signIn(formData: FormData)`
Autentica usuário existente.

**Input:** `email`, `password`

**Output:** `{ error: string }` ou redirect `/dashboard`

---

#### `signOut()`
Encerra sessão e redireciona para `/entrar`.

---

### `progress.ts`

#### `completeLessonAction(payload)`
Registra conclusão de lição e concede XP/moedas.

**Input:**
```typescript
{
  lessonId: string     // UUID
  answers: Array<{
    exerciseId: string
    answer: string
    isCorrect: boolean
    timeMs?: number
  }>
}
```

**Validação Zod:** lessonId UUID, answers array não vazio.

**Output:**
```typescript
{ success: true, xpEarned: number, coinsEarned: number }
{ error: string }
```

**Anti-cheat:** os campos `isCorrect`/`xpReward`/`coinReward` do payload são **ignorados**.
A correção é recalculada no servidor contra `exercises.correct_answer` e a recompensa é
derivada de `lessons` dentro do RPC. Refazer uma lição já concluída credita **0** XP/moedas.

**Efeitos colaterais:**
- Chama `award_lesson_completion(p_user_id, p_lesson_id)` RPC (atômico; lê recompensa de
  `lessons`, zera em recompletação e grava `user_lesson_progress`)
- Registra cada resposta em `user_exercise_answers`
- `revalidatePath('/dashboard')`, `revalidatePath('/modulos')`

---

### `answers.ts`

#### `checkExerciseAnswerAction(exerciseId, answer)` / `checkPlacementAnswerAction(questionId, answer)`
Valida uma resposta no servidor **sem nunca enviar o gabarito ao cliente**. O `correct_answer`
não é mais serializado nos DTOs/queries dos players; ele é revelado apenas como retorno destas
actions, depois que o usuário responde.

**Output:** `{ isCorrect: boolean, correctAnswer: string }` ou `{ error: string }`

Usadas por `ExercisePlayer`, `RankedPlayer` e `PlacementPlayer` para o feedback imediato e o
destaque da alternativa correta.

---

### `ranked.ts`

#### `saveRankedGameAction(payload)`
Salva resultado de partida ranqueada e atualiza ELO.

**Input:**
```typescript
{
  answers: Array<{
    exerciseId: string
    answer: string
    isCorrect: boolean
    timeMs?: number
    difficulty: 'easy' | 'medium' | 'hard'
    isSkipped?: boolean
  }>
  mode: 'practice' | 'ranked'
}
```

**Cálculo de score (modo ranked):**
```
weighted_correct = Σ(isCorrect ? weight[difficulty] : 0)
weighted_total   = Σ(weight[difficulty])  // easy=1, med=1.5, hard=2
accuracy         = weighted_correct / weighted_total
time_bonus       = (1 - avg(clamp(timeMs, 2000, 60000))/60000) * 100  // timeMs limitado p/ anti-cheat
score            = accuracy * 0.95 + time_bonus * 0.05

LP delta:
  score ≥ 0.90 → +30
  score ≥ 0.75 → +20
  score ≥ 0.60 → +10
  score ≥ 0.40 → +0
  score ≥ 0.30 → -15
  score <  0.30 → -28
  + penalidade de skip: -2 por resposta pulada
```

**Recompensas XP/moedas:**
- 15 XP + 5 moedas por resposta correta
- Bônus de acurácia

**Output:**
```typescript
{
  success: true
  lpDelta: number
  newLp: number
  newTier: string
  newDivision: number
  promoted: boolean
  demoted: boolean
  xpEarned: number
  coinsEarned: number
}
{ error: string }
```

**Efeitos colaterais:** `revalidatePath('/ranqueada')`, `/dashboard`

---

### `elo.ts`

#### `savePlacementAction(payload)`
Calcula e salva ELO inicial após placement test.

**Input:**
```typescript
{
  answers: Array<{ exerciseId: string; isCorrect: boolean }>
  score: number   // 0–15 (questões corretas)
}
```

**Lógica de tier inicial:**
```
score 14–15 → Platina III
score 12–13 → Ouro II
score 10–11 → Ouro IV
score  8–9  → Prata II
score  6–7  → Prata IV
score  4–5  → Bronze II
score  0–3  → Bronze IV
```

**Output:** `{ success: true, tier, division }` ou `{ error }`

**Efeitos:** `revalidatePath('/ranqueada')`, `/dashboard`

---

### `shop.ts`

#### `purchaseItemAction(itemId: string)`
Compra item com moedas.

**Fluxo:** chama RPC `purchase_item` (atômico).

**Output:** `{ success: true }` ou `{ error: string }`

#### `setItemEquippedAction(itemId: string, equipped: boolean)`
Equipa/desequipa item.

**Output:** `{ success: true }` ou `{ error }`

---

### `avatar.ts`

#### `saveAvatarConfigAction(config: AvatarConfig)`
Salva configuração do avatar.

**Input:** objeto com todos os campos de `AvatarConfig` (skin_tone, eye_color, etc.)

**Output:** `{ success: true }` ou `{ error }`

---

### `account.ts`

#### `resetProgressAction()`
Zera progresso do usuário (XP, moedas, lições, respostas).

**⚠️ Irreversível.** Requer confirmação no UI.

#### `deleteAccountAction()`
Deleta conta e todos os dados do usuário.

**⚠️ Irreversível.** Cascade delete via RLS + SQL.

---

## Autenticação nos Server Actions

Todos os Server Actions autenticados seguem o padrão:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Não autenticado' }
```

## Leitura de dados (RSC)

Não há endpoints REST para leitura — os Server Components chamam repositórios diretamente:

```typescript
// Padrão em qualquer page.tsx RSC
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/entrar')

const repo = new SupabaseLearningRepository(supabase)
const modules = await repo.findAllModules()
```

## API Route

Apenas uma:

### `GET /auth/callback`
**Arquivo:** `src/app/auth/callback/route.ts`

Troca o `code` OAuth/email por sessão Supabase e redireciona para `/dashboard`.

```
GET /auth/callback?code=xxx&next=/dashboard
→ supabase.auth.exchangeCodeForSession(code)
→ redirect(next)
```
