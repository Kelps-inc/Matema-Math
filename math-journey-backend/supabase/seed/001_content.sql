-- ============================================================
-- MATEMA — Seed de conteúdo (módulos, lições e exercícios)
-- ============================================================

-- MÓDULOS
insert into public.modules (id, slug, title, description, icon, color, order_index, is_free) values
(
  'a1b2c3d4-0001-0000-0000-000000000001',
  'numeros-operacoes',
  'Números e Operações',
  'MMC, MDC, frações, potências e expressões numéricas. Base de tudo no ENEM.',
  '🔢',
  '#D4845A',
  1,
  true
),
(
  'a1b2c3d4-0002-0000-0000-000000000002',
  'algebra-funcoes',
  'Álgebra e Funções',
  'Equações, funções de 1º e 2º grau, progressões e logaritmos.',
  '📐',
  '#6B9E7A',
  2,
  false
),
(
  'a1b2c3d4-0003-0000-0000-000000000003',
  'geometria',
  'Geometria',
  'Geometria plana, espacial e analítica. Áreas, volumes e trigonometria.',
  '📏',
  '#8B7CC4',
  3,
  false
),
(
  'a1b2c3d4-0004-0000-0000-000000000004',
  'estatistica-probabilidade',
  'Estatística e Probabilidade',
  'Média, mediana, moda, desvio padrão e probabilidade clássica.',
  '📊',
  '#E8A838',
  4,
  false
);

-- ============================================================
-- LIÇÕES — Módulo 1: Números e Operações
-- ============================================================

insert into public.lessons (id, module_id, slug, title, description, order_index, xp_reward, coin_reward) values
(
  'b1b2c3d4-0101-0000-0000-000000000001',
  'a1b2c3d4-0001-0000-0000-000000000001',
  'mmc-mdc',
  'MMC e MDC',
  'Mínimo Múltiplo Comum e Máximo Divisor Comum — como calcular e quando usar.',
  1, 30, 8
),
(
  'b1b2c3d4-0102-0000-0000-000000000002',
  'a1b2c3d4-0001-0000-0000-000000000001',
  'fracoes',
  'Frações',
  'Operações com frações: soma, subtração, multiplicação e divisão.',
  2, 30, 8
),
(
  'b1b2c3d4-0103-0000-0000-000000000003',
  'a1b2c3d4-0001-0000-0000-000000000001',
  'potencias-raizes',
  'Potências e Raízes',
  'Propriedades das potências, radiciação e racionalização.',
  3, 35, 10
),
(
  'b1b2c3d4-0104-0000-0000-000000000004',
  'a1b2c3d4-0001-0000-0000-000000000001',
  'expressoes-numericas',
  'Expressões Numéricas',
  'Ordem das operações, parênteses e expressões com todas as operações.',
  4, 25, 7
);

-- ============================================================
-- EXERCÍCIOS — Lição 1.1: MMC e MDC
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0101-0000-0000-000000000001',
  'Qual é o MMC de 12 e 18?',
  null,
  'multiple_choice',
  '["6", "36", "72", "24"]',
  '36',
  'Fatorando: 12 = 2² × 3 e 18 = 2 × 3². O MMC é o produto dos fatores com maior expoente: 2² × 3² = 4 × 9 = 36.',
  'easy',
  1
),
(
  'b1b2c3d4-0101-0000-0000-000000000001',
  'Qual é o MDC de 24 e 36?',
  null,
  'multiple_choice',
  '["4", "6", "12", "24"]',
  '12',
  'Fatorando: 24 = 2³ × 3 e 36 = 2² × 3². O MDC é o produto dos fatores comuns com menor expoente: 2² × 3 = 4 × 3 = 12.',
  'easy',
  2
),
(
  'b1b2c3d4-0101-0000-0000-000000000001',
  'Dois ônibus partem do mesmo terminal às 6h. Um volta a cada 20 minutos e o outro a cada 30 minutos. A que horas eles voltarão juntos ao terminal pela primeira vez?',
  'Problema clássico de ENEM que usa MMC para encontrar o momento em que dois ciclos coincidem.',
  'multiple_choice',
  '["6h40min", "7h00min", "7h30min", "8h00min"]',
  '7h00min',
  'O MMC de 20 e 30: 20 = 2² × 5 e 30 = 2 × 3 × 5. MMC = 2² × 3 × 5 = 60 minutos. 6h + 60min = 7h00min.',
  'medium',
  3
),
(
  'b1b2c3d4-0101-0000-0000-000000000001',
  'O MMC de dois números é sempre maior ou igual ao MDC desses mesmos números.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! O MDC é sempre divisor dos números, enquanto o MMC é múltiplo. Para quaisquer dois inteiros positivos a e b: MDC(a,b) × MMC(a,b) = a × b, o que garante MMC ≥ MDC.',
  'easy',
  4
),
(
  'b1b2c3d4-0101-0000-0000-000000000001',
  'Uma professora quer distribuir 48 lápis e 36 canetas em kits iguais, sem sobrar nada. Qual é o número máximo de kits que ela pode fazer?',
  'ENEM 2019 — adaptado.',
  'multiple_choice',
  '["6", "9", "12", "18"]',
  '12',
  'O MDC de 48 e 36 dá o número máximo de kits. 48 = 2⁴ × 3 e 36 = 2² × 3². MDC = 2² × 3 = 12. Cada kit terá 4 lápis e 3 canetas.',
  'medium',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 1.2: Frações
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0102-0000-0000-000000000002',
  'Calcule: 1/2 + 1/3',
  null,
  'multiple_choice',
  '["2/5", "5/6", "2/6", "1/6"]',
  '5/6',
  'O MMC de 2 e 3 é 6. Então: 3/6 + 2/6 = 5/6.',
  'easy',
  1
),
(
  'b1b2c3d4-0102-0000-0000-000000000002',
  'Simplifique a fração 24/36 à sua forma irredutível.',
  null,
  'multiple_choice',
  '["4/6", "2/3", "12/18", "6/9"]',
  '2/3',
  'MDC(24, 36) = 12. Dividindo ambos por 12: 24/12 = 2 e 36/12 = 3. Resultado: 2/3.',
  'easy',
  2
),
(
  'b1b2c3d4-0102-0000-0000-000000000002',
  'Uma receita pede 3/4 de xícara de açúcar. Se você quiser fazer 2/3 da receita, quanto de açúcar você vai usar?',
  'Multiplicação de frações em contexto prático.',
  'multiple_choice',
  '["1/2", "5/7", "6/12", "1/4"]',
  '1/2',
  'Multiplicando: 3/4 × 2/3 = (3×2)/(4×3) = 6/12 = 1/2 xícara.',
  'medium',
  3
),
(
  'b1b2c3d4-0102-0000-0000-000000000002',
  'Calcule: (3/4) ÷ (3/8)',
  null,
  'multiple_choice',
  '["9/32", "1/2", "2", "1"]',
  '2',
  'Dividir por uma fração é multiplicar pelo inverso: 3/4 × 8/3 = 24/12 = 2.',
  'medium',
  4
),
(
  'b1b2c3d4-0102-0000-0000-000000000002',
  'Um terreno tem 2/5 de sua área plantada com soja e 1/4 com milho. Qual fração do terreno está plantada?',
  'ENEM — contexto agrário.',
  'multiple_choice',
  '["3/9", "13/20", "3/20", "7/20"]',
  '13/20',
  'MMC(5, 4) = 20. Convertendo: 2/5 = 8/20 e 1/4 = 5/20. Somando: 8/20 + 5/20 = 13/20.',
  'medium',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 1.3: Potências e Raízes
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0103-0000-0000-000000000003',
  'Simplifique: 2³ × 2⁴',
  null,
  'multiple_choice',
  '["2¹²", "2⁷", "4⁷", "8⁷"]',
  '2⁷',
  'Quando multiplicamos potências de mesma base, somamos os expoentes: 2³ × 2⁴ = 2^(3+4) = 2⁷.',
  'easy',
  1
),
(
  'b1b2c3d4-0103-0000-0000-000000000003',
  'Calcule: √144',
  null,
  'multiple_choice',
  '["11", "12", "13", "14"]',
  '12',
  '12 × 12 = 144, portanto √144 = 12.',
  'easy',
  2
),
(
  'b1b2c3d4-0103-0000-0000-000000000003',
  'Qual é o valor de (2³)²?',
  null,
  'multiple_choice',
  '["2⁵", "2⁶", "2⁹", "64"]',
  '2⁶',
  'Potência de potência: multiplicamos os expoentes. (2³)² = 2^(3×2) = 2⁶. Note que 2⁶ = 64, ambas as respostas são equivalentes, mas a forma simplificada é 2⁶.',
  'easy',
  3
),
(
  'b1b2c3d4-0103-0000-0000-000000000003',
  'Racionalize o denominador de 1/√2.',
  null,
  'multiple_choice',
  '["√2", "√2/2", "2/√2", "1/2"]',
  '√2/2',
  'Multiplicamos numerador e denominador por √2: (1 × √2)/(√2 × √2) = √2/2.',
  'medium',
  4
),
(
  'b1b2c3d4-0103-0000-0000-000000000003',
  'Uma bactéria dobra seu número a cada hora. Se há 1 bactéria no início, quantas haverá após 10 horas?',
  'Crescimento exponencial — tema recorrente no ENEM.',
  'multiple_choice',
  '["512", "1.024", "2.048", "20"]',
  '1.024',
  'Cada hora o número dobra: após n horas há 2ⁿ bactérias. Após 10 horas: 2¹⁰ = 1.024.',
  'medium',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 1.4: Expressões Numéricas
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0104-0000-0000-000000000004',
  'Calcule: 2 + 3 × 4',
  null,
  'multiple_choice',
  '["20", "14", "24", "10"]',
  '14',
  'A multiplicação tem prioridade sobre a adição. Primeiro: 3 × 4 = 12. Depois: 2 + 12 = 14.',
  'easy',
  1
),
(
  'b1b2c3d4-0104-0000-0000-000000000004',
  'Calcule: (5 + 3) × 2 - 4 ÷ 2',
  null,
  'multiple_choice',
  '["14", "16", "10", "12"]',
  '14',
  'Passo 1 (parênteses): 5 + 3 = 8. Passo 2 (mult/div da esq. p/ dir.): 8 × 2 = 16 e 4 ÷ 2 = 2. Passo 3 (soma/sub.): 16 - 2 = 14.',
  'easy',
  2
),
(
  'b1b2c3d4-0104-0000-0000-000000000004',
  'Na expressão 3² + (4 - 1) × 2, qual é o resultado?',
  null,
  'multiple_choice',
  '["15", "24", "12", "33"]',
  '15',
  'Passo 1 (potência): 3² = 9. Passo 2 (parênteses): 4 - 1 = 3. Passo 3 (mult.): 3 × 2 = 6. Passo 4: 9 + 6 = 15.',
  'medium',
  3
),
(
  'b1b2c3d4-0104-0000-0000-000000000004',
  'A divisão sempre tem prioridade sobre a multiplicação em uma expressão numérica.',
  null,
  'true_false',
  null,
  'false',
  'Falso! Multiplicação e divisão têm a mesma prioridade — quando aparecem juntas, resolvemos da esquerda para a direita.',
  'easy',
  4
),
(
  'b1b2c3d4-0104-0000-0000-000000000004',
  'Calcule: 100 - 2³ × (6 ÷ 2 + 1)',
  null,
  'multiple_choice',
  '["68", "36", "100", "72"]',
  '68',
  'Passo 1: 2³ = 8. Passo 2: 6 ÷ 2 = 3. Passo 3: 3 + 1 = 4. Passo 4: 8 × 4 = 32. Passo 5: 100 - 32 = 68.',
  'hard',
  5
);
