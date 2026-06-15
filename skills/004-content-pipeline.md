# Skill 004 — Content Pipeline

## O que é

Pipeline de ingestão de conteúdo matemático (módulos, lições, exercícios) no banco de dados Supabase.

## Fonte de verdade atual

Todo o conteúdo fica em:
```
math-journey-backend/supabase/seed/001_content.sql
```

## Estrutura do SQL de conteúdo

```sql
-- 1. Inserir módulo
INSERT INTO modules (id, slug, title, description, icon, color, order_index, is_free)
VALUES (
  gen_random_uuid(),
  'meu-modulo',
  'Meu Módulo',
  'Descrição do módulo',
  '🔢',
  '#D4845A',
  1,
  true
);

-- 2. Inserir lição (referencie o módulo pelo slug em subquery)
INSERT INTO lessons (id, module_id, slug, title, description, theory, order_index, xp_reward, coin_reward)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM modules WHERE slug = 'meu-modulo'),
  'minha-licao',
  'Título da Lição',
  'Descrição curta',
  'Teoria em texto. Pode usar **markdown** básico.',
  1,   -- order_index
  30,  -- xp_reward
  8    -- coin_reward
);

-- 3. Inserir exercícios
INSERT INTO exercises (id, lesson_id, question, type, options, correct_answer, explanation, difficulty, order_index)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM lessons WHERE slug = 'minha-licao'),
  'Quanto é $2 + 2$?',                           -- LaTeX OK com $...$
  'multiple_choice',
  '["2", "3", "4", "5"]'::jsonb,                 -- array JSON de 4 opções
  '4',                                            -- resposta correta (exata)
  'A soma de 2 + 2 é igual a 4.',                 -- explicação
  'easy',                                         -- easy | medium | hard
  1                                               -- order_index
);
```

## Tipos de exercício

| Tipo | `options` | `correct_answer` |
|---|---|---|
| `multiple_choice` | Array JSON com 4 strings | Uma das strings do array (exata) |
| `true_false` | `'["Verdadeiro", "Falso"]'::jsonb` | `'Verdadeiro'` ou `'Falso'` |
| `numeric` | `'[]'::jsonb` (vazio) | Número como string, ex: `'42'` |

## Questões com LaTeX

Use `$...$` para matemática inline e `$$...$$` para bloco:

```sql
'Calcule $\frac{a+b}{2}$ para $a=4$ e $b=6$.'
```

**Importante**: Não use `$` precedido de letra/número (como `R$`) — o parser da MathText.tsx ignora isso via lookbehind.

## Questões ENEM

Para marcar uma questão como sendo do ENEM, use a coluna `source`:

```sql
INSERT INTO exercises (..., source) VALUES (..., 'ENEM 2023');
```

Questões sem `source` ou com `source = NULL` exibem "Original Matema".

O modo "Estilo ENEM" requer que o módulo de Combinatória/Probabilidade tenha pelo menos 3 questões ENEM desbloqueadas.

## Adicionando novo conteúdo

### Opção 1: Via SQL Editor do Supabase (rápido)
1. Escreva o INSERT no arquivo seed
2. Execute no SQL Editor do Supabase dashboard

### Opção 2: Via admin preview
1. Acesse `/admin/preview-questoes` como usuário admin
2. Use para verificar se exercícios existentes estão corretos

## Validações antes de inserir

- [ ] `slug` único dentro do módulo (para lições)
- [ ] `options` tem exatamente 4 itens para `multiple_choice`
- [ ] `correct_answer` está nos `options` para `multiple_choice`
- [ ] `order_index` sequencial sem gaps
- [ ] LaTeX balanceado (`$` abre e fecha)
- [ ] `difficulty` é um dos enums: `easy`, `medium`, `hard`

## Placement questions

Para o placement test, use a tabela separada `placement_questions`:

```sql
INSERT INTO placement_questions (id, question, options, correct_answer, difficulty, order_index)
VALUES (
  gen_random_uuid(),
  'Questão do placement...',
  '["A", "B", "C", "D"]'::jsonb,
  'B',
  'medium',
  1
);
```

O placement test usa 15 questões. `order_index` determina a ordem de exibição.
