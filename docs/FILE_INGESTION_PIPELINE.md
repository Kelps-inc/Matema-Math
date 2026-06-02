# File Ingestion Pipeline — Matema

Este documento descreve como conteúdo (módulos, lições, exercícios) é criado e inserido no banco.

## Fluxo atual

```
Autor (dev/educador)
  → escreve SQL no arquivo seed
  → executa no Supabase SQL Editor
  → conteúdo disponível na plataforma imediatamente
```

## Arquivos de conteúdo

```
math-journey-backend/supabase/
  migrations/
    001_initial_schema.sql    → schema, enums, RLS, triggers, functions
  seed/
    001_content.sql           → módulos, lições, exercícios iniciais
```

## Hierarquia de conteúdo

```
Module (módulo)
  └─ Lesson (lição)         xp_reward, coin_reward
       └─ Exercise (questão) type, difficulty, options, correct_answer
```

## Tipos de exercício suportados

| Tipo | Estrutura |
|---|---|
| `multiple_choice` | 4 options em JSONB, correct_answer = um dos options |
| `true_false` | options = `["Verdadeiro", "Falso"]`, correct_answer = "Verdadeiro" ou "Falso" |
| `numeric` | options = `[]`, correct_answer = número como string |

## LaTeX em questões

Suportado via KaTeX. Delimitadores:
- Inline: `$expressão$`
- Display: `$$expressão$$`

Exemplos válidos:
```
'Calcule $\frac{1}{2} + \frac{1}{3}$'
'Resolva $$x^2 - 4 = 0$$'
'Se $a = 3$ e $b = 4$, quanto é $a^2 + b^2$?'
```

⚠️ O parser tem lookbehind para evitar confundir `R$` (real brasileiro) com LaTeX.

## Marcação de fonte (ENEM)

```sql
-- Questão do ENEM
INSERT INTO exercises (..., source) VALUES (..., 'ENEM 2023');

-- Questão original
INSERT INTO exercises (..., source) VALUES (..., NULL);
-- ou simplesmente omita a coluna
```

A UI exibe o badge "ENEM 2023" ou "Original Matema" baseado nessa coluna.

## Template SQL para novo módulo completo

```sql
-- === MÓDULO ===
DO $$
DECLARE
  modulo_id uuid := gen_random_uuid();
  licao1_id uuid := gen_random_uuid();
BEGIN

INSERT INTO modules (id, slug, title, description, icon, color, order_index, is_free)
VALUES (modulo_id, 'meu-modulo', 'Meu Módulo', 'Descrição', '📐', '#6B9E7A', 5, true);

-- === LIÇÃO 1 ===
INSERT INTO lessons (id, module_id, slug, title, description, theory, order_index, xp_reward, coin_reward)
VALUES (licao1_id, modulo_id, 'primeira-licao', 'Primeira Lição', 'Descrição curta',
'Aqui vai o texto de teoria da lição. Pode ser longo.', 1, 30, 8);

-- === EXERCÍCIOS DA LIÇÃO 1 ===
INSERT INTO exercises (id, lesson_id, question, type, options, correct_answer, explanation, difficulty, order_index)
VALUES
  (gen_random_uuid(), licao1_id, 'Questão 1?', 'multiple_choice',
   '["A", "B", "C", "D"]'::jsonb, 'B', 'Explicação da resposta B.', 'easy', 1),
  
  (gen_random_uuid(), licao1_id, 'Questão 2: verdadeiro ou falso?', 'true_false',
   '["Verdadeiro", "Falso"]'::jsonb, 'Verdadeiro', 'Porque X é Y.', 'medium', 2),
  
  (gen_random_uuid(), licao1_id, 'Calcule $2^{10}$:', 'numeric',
   '[]'::jsonb, '1024', '$2^{10} = 1024$', 'hard', 3);

END $$;
```

## Validações antes de executar

- [ ] `slug` único na tabela de módulos
- [ ] `slug` único dentro do módulo (para lições)
- [ ] `options` tem exatamente 4 itens para `multiple_choice`
- [ ] `correct_answer` existe exatamente nos `options` (case-sensitive!)
- [ ] LaTeX bem formado (todo `$` abre e fecha)
- [ ] `order_index` começa em 1 e é sequencial

## Verificação pós-inserção

Acesse `/admin/preview-questoes` com uma conta admin para visualizar e verificar os exercícios inseridos.

## Placement Questions

Para adicionar/modificar questões do placement test (15 questões):

```sql
INSERT INTO placement_questions (id, question, options, correct_answer, difficulty, order_index)
VALUES (
  gen_random_uuid(),
  'Enunciado da questão de placement',
  '["A", "B", "C", "D"]'::jsonb,
  'C',
  'medium',
  16  -- se adicionar depois das 15 existentes
);
```

O PlacementPlayer usa as primeiras 15 por `order_index ASC LIMIT 15`.
