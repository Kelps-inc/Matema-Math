-- ============================================================
-- MATEMA — Seed de conteúdo v2
-- Módulo 2: Álgebra e Funções  (4 lições, 20 exercícios)
-- Módulo 3: Geometria           (4 lições, 20 exercícios)
-- Módulo 4: Estatística         (3 lições, 15 exercícios)
-- ============================================================

-- ============================================================
-- LIÇÕES — Módulo 2: Álgebra e Funções
-- ============================================================

insert into public.lessons (id, module_id, slug, title, description, order_index, xp_reward, coin_reward) values
(
  'b1b2c3d4-0201-0000-0000-000000000001',
  'a1b2c3d4-0002-0000-0000-000000000002',
  'equacoes-1-grau',
  'Equações de 1º Grau',
  'Resolva equações lineares e aplique-as em problemas do cotidiano.',
  1, 30, 8
),
(
  'b1b2c3d4-0202-0000-0000-000000000002',
  'a1b2c3d4-0002-0000-0000-000000000002',
  'funcoes-1-grau',
  'Funções de 1º Grau',
  'Função afim: coeficiente angular, raiz, gráfico e aplicações práticas.',
  2, 35, 10
),
(
  'b1b2c3d4-0203-0000-0000-000000000003',
  'a1b2c3d4-0002-0000-0000-000000000002',
  'equacoes-2-grau',
  'Equações de 2º Grau',
  'Fórmula de Bhaskara, discriminante e interpretação geométrica das raízes.',
  3, 40, 12
),
(
  'b1b2c3d4-0204-0000-0000-000000000004',
  'a1b2c3d4-0002-0000-0000-000000000002',
  'progressoes-aritmeticas',
  'Progressões Aritméticas',
  'Termo geral, soma dos termos e aplicações de PA em problemas ENEM.',
  4, 35, 10
);

-- ============================================================
-- EXERCÍCIOS — Lição 2.1: Equações de 1º Grau
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0201-0000-0000-000000000001',
  'Resolva: $2x + 4 = 10$',
  null,
  'multiple_choice',
  '["x = 2", "x = 3", "x = 7", "x = 5"]',
  'x = 3',
  'Isolando x: $2x = 10 - 4 = 6$, portanto $x = 3$.',
  'easy',
  1
),
(
  'b1b2c3d4-0201-0000-0000-000000000001',
  'Resolva: $3x - 9 = 0$',
  null,
  'multiple_choice',
  '["x = 0", "x = 3", "x = 9", "x = -3"]',
  'x = 3',
  'Isolando x: $3x = 9$, portanto $x = 3$.',
  'easy',
  2
),
(
  'b1b2c3d4-0201-0000-0000-000000000001',
  'Uma camiseta custa R$ 10,00 a mais que uma calça. Juntas custam R$ 90,00. Qual é o preço da camiseta?',
  'Problema de equação de 1º grau com contexto de compra.',
  'multiple_choice',
  '["R$ 40,00", "R$ 50,00", "R$ 60,00", "R$ 80,00"]',
  'R$ 50,00',
  'Sendo x o preço da calça: $x + (x+10) = 90 \Rightarrow 2x = 80 \Rightarrow x = 40$. A camiseta custa R$ 40 + R$ 10 = R$ 50,00.',
  'medium',
  3
),
(
  'b1b2c3d4-0201-0000-0000-000000000001',
  'Resolva: $\frac{x+2}{3} = \frac{x-1}{2}$',
  null,
  'multiple_choice',
  '["x = 4", "x = 7", "x = 8", "x = 1"]',
  'x = 7',
  'Multiplicando em cruz: $2(x+2) = 3(x-1) \Rightarrow 2x+4 = 3x-3 \Rightarrow x = 7$.',
  'medium',
  4
),
(
  'b1b2c3d4-0201-0000-0000-000000000001',
  'Resolva: $4(x - 3) - 2(x - 1) = 6$',
  null,
  'multiple_choice',
  '["x = 5", "x = 6", "x = 7", "x = 8"]',
  'x = 8',
  'Expandindo: $4x - 12 - 2x + 2 = 6 \Rightarrow 2x - 10 = 6 \Rightarrow 2x = 16 \Rightarrow x = 8$.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 2.2: Funções de 1º Grau
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0202-0000-0000-000000000002',
  'Dada $f(x) = 2x + 3$, qual é o valor de $f(4)$?',
  null,
  'multiple_choice',
  '["9", "10", "11", "13"]',
  '11',
  '$f(4) = 2 \cdot 4 + 3 = 8 + 3 = 11$.',
  'easy',
  1
),
(
  'b1b2c3d4-0202-0000-0000-000000000002',
  'Qual é a raiz (zero) da função $f(x) = 3x - 6$?',
  null,
  'multiple_choice',
  '["x = 1", "x = 2", "x = 3", "x = 6"]',
  'x = 2',
  'A raiz é onde $f(x) = 0$: $3x - 6 = 0 \Rightarrow 3x = 6 \Rightarrow x = 2$.',
  'easy',
  2
),
(
  'b1b2c3d4-0202-0000-0000-000000000002',
  'Uma função afim tem $f(1) = 5$ e $f(3) = 11$. Qual é o valor de $f(0)$?',
  null,
  'multiple_choice',
  '["1", "2", "3", "4"]',
  '2',
  'A taxa de variação é $\frac{11-5}{3-1} = 3$, então $f(x) = 3x + b$. Como $f(1) = 5$: $3 + b = 5 \Rightarrow b = 2$. Portanto $f(0) = 2$.',
  'medium',
  3
),
(
  'b1b2c3d4-0202-0000-0000-000000000002',
  'Um táxi cobra R$ 5,00 de bandeirada mais R$ 2,50 por quilômetro. Qual função representa o custo total para uma corrida de $x$ km?',
  'Funções afins modelam situações com custo fixo e custo variável.',
  'multiple_choice',
  '["f(x) = 5x + 2,50", "f(x) = 2,50x + 5", "f(x) = 7,50x", "f(x) = 2,50x - 5"]',
  'f(x) = 2,50x + 5',
  'O custo fixo (bandeirada) é R$ 5,00 e cada km custa R$ 2,50. A função é $f(x) = 2{,}50x + 5$.',
  'medium',
  4
),
(
  'b1b2c3d4-0202-0000-0000-000000000002',
  'Carlos e Paulo saem de cidades a 300 km de distância, um em direção ao outro. Carlos dirige a 60 km/h e Paulo a 90 km/h. Após quantas horas eles se encontram?',
  'ENEM — problemas de encontro são clássicos de função afim.',
  'multiple_choice',
  '["1 hora", "2 horas", "3 horas", "4 horas"]',
  '2 horas',
  'A distância percorrida juntos por hora é $60 + 90 = 150$ km/h. Tempo até cobrir 300 km: $t = 300 \div 150 = 2$ horas.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 2.3: Equações de 2º Grau
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0203-0000-0000-000000000003',
  'Quais são as raízes de $x^2 - 5x + 6 = 0$?',
  null,
  'multiple_choice',
  '["x = 1 e x = 6", "x = 2 e x = 3", "x = -2 e x = -3", "x = 3 e x = 3"]',
  'x = 2 e x = 3',
  'Fatorando: $(x-2)(x-3) = 0$. As raízes são $x = 2$ e $x = 3$.',
  'easy',
  1
),
(
  'b1b2c3d4-0203-0000-0000-000000000003',
  'Qual é o discriminante ($\Delta$) de $x^2 - 4x + 4 = 0$?',
  null,
  'multiple_choice',
  '["0", "4", "8", "16"]',
  '0',
  '$\Delta = b^2 - 4ac = (-4)^2 - 4 \cdot 1 \cdot 4 = 16 - 16 = 0$.',
  'easy',
  2
),
(
  'b1b2c3d4-0203-0000-0000-000000000003',
  'Uma equação do 2º grau com $\Delta < 0$ possui duas raízes reais distintas.',
  null,
  'true_false',
  null,
  'false',
  'Falso! Quando $\Delta < 0$, a equação não possui raízes reais. Há duas raízes reais distintas apenas quando $\Delta > 0$, e raízes iguais quando $\Delta = 0$.',
  'medium',
  3
),
(
  'b1b2c3d4-0203-0000-0000-000000000003',
  'Resolva: $x^2 - 7x + 10 = 0$',
  null,
  'multiple_choice',
  '["x = 2 e x = 5", "x = 1 e x = 10", "x = -2 e x = -5", "x = 3 e x = 4"]',
  'x = 2 e x = 5',
  '$\Delta = 49 - 40 = 9$. $x = \frac{7 \pm 3}{2}$. Portanto $x_1 = 5$ e $x_2 = 2$.',
  'medium',
  4
),
(
  'b1b2c3d4-0203-0000-0000-000000000003',
  'Um terreno retangular tem perímetro de 26 m e área de 40 m². Quais são suas dimensões?',
  'ENEM — problemas de área e perímetro levam a equações do 2º grau.',
  'multiple_choice',
  '["4 m e 10 m", "5 m e 8 m", "6 m e 7 m", "3 m e 11 m"]',
  '5 m e 8 m',
  'Se $L + W = 13$ e $L \cdot W = 40$, então $W^2 - 13W + 40 = 0$. $\Delta = 169 - 160 = 9$. $W = \frac{13 \pm 3}{2}$, ou seja, 5 m e 8 m.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 2.4: Progressões Aritméticas
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0204-0000-0000-000000000004',
  'Na PA $(2, 5, 8, 11, \ldots)$, qual é a razão?',
  null,
  'multiple_choice',
  '["1", "2", "3", "4"]',
  '3',
  'A razão é a diferença entre termos consecutivos: $r = 5 - 2 = 3$.',
  'easy',
  1
),
(
  'b1b2c3d4-0204-0000-0000-000000000004',
  'Na PA $(1, 4, 7, 10, \ldots)$, qual é o 6º termo?',
  null,
  'multiple_choice',
  '["13", "14", "15", "16"]',
  '16',
  'Fórmula do termo geral: $a_n = a_1 + (n-1) \cdot r = 1 + (6-1) \cdot 3 = 1 + 15 = 16$.',
  'easy',
  2
),
(
  'b1b2c3d4-0204-0000-0000-000000000004',
  'Qual é a soma dos 10 primeiros termos da PA com $a_1 = 3$ e $r = 2$?',
  null,
  'multiple_choice',
  '["90", "100", "110", "120"]',
  '120',
  '$S_{10} = \frac{10}{2}(2 \cdot 3 + 9 \cdot 2) = 5 \cdot (6 + 18) = 5 \cdot 24 = 120$.',
  'medium',
  3
),
(
  'b1b2c3d4-0204-0000-0000-000000000004',
  'Em uma PA, o 1º termo é 5 e o 7º termo é 29. Qual é a razão?',
  null,
  'multiple_choice',
  '["3", "4", "5", "6"]',
  '4',
  '$a_7 = a_1 + 6r \Rightarrow 29 = 5 + 6r \Rightarrow 6r = 24 \Rightarrow r = 4$.',
  'medium',
  4
),
(
  'b1b2c3d4-0204-0000-0000-000000000004',
  'Uma empresa paga ao funcionário R$ 1.200,00 no primeiro mês, com aumentos mensais de R$ 100,00. Após quantos meses o funcionário receberá R$ 2.200,00?',
  'ENEM 2017 — adaptado. Progressões modelam situações de crescimento constante.',
  'multiple_choice',
  '["8", "9", "10", "11"]',
  '11',
  '$a_n = 1200 + (n-1) \cdot 100 = 2200 \Rightarrow (n-1) \cdot 100 = 1000 \Rightarrow n - 1 = 10 \Rightarrow n = 11$.',
  'hard',
  5
);

-- ============================================================
-- LIÇÕES — Módulo 3: Geometria
-- ============================================================

insert into public.lessons (id, module_id, slug, title, description, order_index, xp_reward, coin_reward) values
(
  'b1b2c3d4-0301-0000-0000-000000000001',
  'a1b2c3d4-0003-0000-0000-000000000003',
  'areas-figuras-planas',
  'Áreas de Figuras Planas',
  'Calcule áreas de retângulos, triângulos, trapézios e círculos.',
  1, 35, 10
),
(
  'b1b2c3d4-0302-0000-0000-000000000002',
  'a1b2c3d4-0003-0000-0000-000000000003',
  'teorema-pitagoras',
  'Teorema de Pitágoras',
  'Relação entre os lados de um triângulo retângulo e suas aplicações.',
  2, 35, 10
),
(
  'b1b2c3d4-0303-0000-0000-000000000003',
  'a1b2c3d4-0003-0000-0000-000000000003',
  'volumes-solidos',
  'Volumes de Sólidos',
  'Volumes de cubos, paralelepípedos, cilindros e pirâmides.',
  3, 40, 12
),
(
  'b1b2c3d4-0304-0000-0000-000000000004',
  'a1b2c3d4-0003-0000-0000-000000000003',
  'trigonometria-basica',
  'Trigonometria Básica',
  'Seno, cosseno e tangente nos triângulos retângulos e problemas ENEM.',
  4, 40, 12
);

-- ============================================================
-- EXERCÍCIOS — Lição 3.1: Áreas de Figuras Planas
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0301-0000-0000-000000000001',
  'Qual é a área de um retângulo com base 8 cm e altura 5 cm?',
  null,
  'multiple_choice',
  '["26 cm²", "40 cm²", "13 cm²", "64 cm²"]',
  '40 cm²',
  '$A = base \times altura = 8 \times 5 = 40 \text{ cm}^2$.',
  'easy',
  1
),
(
  'b1b2c3d4-0301-0000-0000-000000000001',
  'Um triângulo tem base 10 cm e altura 6 cm. Qual é a sua área?',
  null,
  'multiple_choice',
  '["60 cm²", "30 cm²", "16 cm²", "20 cm²"]',
  '30 cm²',
  '$A = \frac{base \times altura}{2} = \frac{10 \times 6}{2} = 30 \text{ cm}^2$.',
  'easy',
  2
),
(
  'b1b2c3d4-0301-0000-0000-000000000001',
  'Qual é a área de um círculo com raio 7 cm? (Use $\pi \approx 3{,}14$)',
  null,
  'multiple_choice',
  '["43,96 cm²", "153,86 cm²", "21,98 cm²", "49 cm²"]',
  '153,86 cm²',
  '$A = \pi r^2 = 3{,}14 \times 7^2 = 3{,}14 \times 49 = 153{,}86 \text{ cm}^2$.',
  'medium',
  3
),
(
  'b1b2c3d4-0301-0000-0000-000000000001',
  'Um trapézio tem bases 12 cm e 8 cm, com altura 5 cm. Qual é a sua área?',
  null,
  'multiple_choice',
  '["40 cm²", "50 cm²", "60 cm²", "100 cm²"]',
  '50 cm²',
  '$A = \frac{(B + b)}{2} \times h = \frac{(12 + 8)}{2} \times 5 = 10 \times 5 = 50 \text{ cm}^2$.',
  'medium',
  4
),
(
  'b1b2c3d4-0301-0000-0000-000000000001',
  'Uma sala tem formato de L. O retângulo maior mede 10 m × 8 m e um canto de 4 m × 3 m foi retirado. Qual é a área útil da sala?',
  'ENEM — áreas de figuras compostas aparecem frequentemente em problemas de reforma e construção.',
  'multiple_choice',
  '["60 m²", "68 m²", "72 m²", "80 m²"]',
  '68 m²',
  'Área total menos o canto removido: $A = 10 \times 8 - 4 \times 3 = 80 - 12 = 68 \text{ m}^2$.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 3.2: Teorema de Pitágoras
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0302-0000-0000-000000000002',
  'Em um triângulo retângulo com catetos 3 cm e 4 cm, qual é a medida da hipotenusa?',
  null,
  'multiple_choice',
  '["5 cm", "6 cm", "7 cm", "√7 cm"]',
  '5 cm',
  '$h^2 = 3^2 + 4^2 = 9 + 16 = 25 \Rightarrow h = 5 \text{ cm}$. Este é o famoso triângulo 3-4-5.',
  'easy',
  1
),
(
  'b1b2c3d4-0302-0000-0000-000000000002',
  'Um triângulo com lados 6 cm, 8 cm e 10 cm é um triângulo retângulo.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! $6^2 + 8^2 = 36 + 64 = 100 = 10^2$. Como satisfaz o Teorema de Pitágoras, é retângulo.',
  'easy',
  2
),
(
  'b1b2c3d4-0302-0000-0000-000000000002',
  'Em um triângulo retângulo, a hipotenusa mede 13 cm e um cateto mede 5 cm. Qual é a medida do outro cateto?',
  null,
  'multiple_choice',
  '["8 cm", "10 cm", "11 cm", "12 cm"]',
  '12 cm',
  '$c^2 = 13^2 - 5^2 = 169 - 25 = 144 \Rightarrow c = 12 \text{ cm}$.',
  'medium',
  3
),
(
  'b1b2c3d4-0302-0000-0000-000000000002',
  'Qual é a medida da diagonal de um quadrado de lado 6 cm?',
  null,
  'multiple_choice',
  '["6 cm", "6√2 cm", "12 cm", "36 cm"]',
  '6√2 cm',
  'A diagonal divide o quadrado em dois triângulos retângulos isósceles: $d^2 = 6^2 + 6^2 = 72 \Rightarrow d = \sqrt{72} = 6\sqrt{2} \text{ cm}$.',
  'medium',
  4
),
(
  'b1b2c3d4-0302-0000-0000-000000000002',
  'Uma escada de 10 m está apoiada em uma parede vertical. A base da escada está a 6 m da parede. A que altura a escada encosta na parede?',
  'ENEM — o Teorema de Pitágoras é a base de inúmeros problemas práticos de engenharia.',
  'multiple_choice',
  '["4 m", "6 m", "8 m", "10 m"]',
  '8 m',
  '$h^2 = 10^2 - 6^2 = 100 - 36 = 64 \Rightarrow h = 8 \text{ m}$.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 3.3: Volumes de Sólidos
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0303-0000-0000-000000000003',
  'Qual é o volume de um cubo com aresta 3 cm?',
  null,
  'multiple_choice',
  '["9 cm³", "18 cm³", "27 cm³", "81 cm³"]',
  '27 cm³',
  '$V = a^3 = 3^3 = 27 \text{ cm}^3$.',
  'easy',
  1
),
(
  'b1b2c3d4-0303-0000-0000-000000000003',
  'Um paralelepípedo tem dimensões 4 cm × 5 cm × 3 cm. Qual é o seu volume?',
  null,
  'multiple_choice',
  '["36 cm³", "48 cm³", "60 cm³", "72 cm³"]',
  '60 cm³',
  '$V = c \times l \times h = 4 \times 5 \times 3 = 60 \text{ cm}^3$.',
  'easy',
  2
),
(
  'b1b2c3d4-0303-0000-0000-000000000003',
  'Qual é o volume de um cilindro com raio 3 cm e altura 10 cm? (Use $\pi \approx 3{,}14$)',
  null,
  'multiple_choice',
  '["94,2 cm³", "188,4 cm³", "282,6 cm³", "565,2 cm³"]',
  '282,6 cm³',
  '$V = \pi r^2 h = 3{,}14 \times 3^2 \times 10 = 3{,}14 \times 9 \times 10 = 282{,}6 \text{ cm}^3$.',
  'medium',
  3
),
(
  'b1b2c3d4-0303-0000-0000-000000000003',
  'O volume de qualquer pirâmide é igual a $\frac{1}{3}$ da área da base multiplicada pela altura.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! $V = \frac{1}{3} \times A_{base} \times h$. Isso vale para pirâmides de qualquer base (triangular, quadrada, etc.).',
  'medium',
  4
),
(
  'b1b2c3d4-0303-0000-0000-000000000003',
  'Uma caixa de leite tem base 7 cm × 4 cm e altura 20 cm. Quantos litros de leite ela comporta? (1 L = 1.000 cm³)',
  'ENEM — conversão de unidades de volume é cobrada em diversos contextos: embalagens, piscinas, reservatórios.',
  'multiple_choice',
  '["0,36 L", "0,56 L", "0,72 L", "5,6 L"]',
  '0,56 L',
  '$V = 7 \times 4 \times 20 = 560 \text{ cm}^3 = 0{,}56 \text{ L}$.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 3.4: Trigonometria Básica
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0304-0000-0000-000000000004',
  'Em um triângulo retângulo, qual é o valor de $\text{sen}(30°)$?',
  null,
  'multiple_choice',
  '["1", "√3/2", "1/2", "√2/2"]',
  '1/2',
  '$\text{sen}(30°) = \frac{1}{2}$. Este é um valor fundamental da trigonometria que deve ser memorizado.',
  'easy',
  1
),
(
  'b1b2c3d4-0304-0000-0000-000000000004',
  'Em um triângulo retângulo com ângulo de 45°, o seno e o cosseno desse ângulo são iguais.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! $\text{sen}(45°) = \text{cos}(45°) = \frac{\sqrt{2}}{2}$. Isso ocorre porque o triângulo retângulo com 45° é isósceles — os dois catetos têm o mesmo comprimento.',
  'easy',
  2
),
(
  'b1b2c3d4-0304-0000-0000-000000000004',
  'Em um triângulo retângulo, a hipotenusa mede 10 cm e um ângulo agudo mede 30°. Qual é o cateto oposto a esse ângulo?',
  null,
  'multiple_choice',
  '["5 cm", "5√3 cm", "5√2 cm", "10 cm"]',
  '5 cm',
  '$\text{cateto oposto} = \text{hipotenusa} \times \text{sen}(30°) = 10 \times \frac{1}{2} = 5 \text{ cm}$.',
  'medium',
  3
),
(
  'b1b2c3d4-0304-0000-0000-000000000004',
  'Qual é o valor de $\text{tg}(60°)$?',
  null,
  'multiple_choice',
  '["1", "1/2", "√3/2", "√3"]',
  '√3',
  '$\text{tg}(60°) = \frac{\text{sen}(60°)}{\text{cos}(60°)} = \frac{\sqrt{3}/2}{1/2} = \sqrt{3}$.',
  'medium',
  4
),
(
  'b1b2c3d4-0304-0000-0000-000000000004',
  'Um poste vertical mede 6 m. Uma corda vai do seu topo até o chão formando um ângulo de 30° com o solo. Qual é o comprimento da corda?',
  'ENEM — problemas de altura e distância são resolvidos com trigonometria.',
  'multiple_choice',
  '["6 m", "8 m", "10 m", "12 m"]',
  '12 m',
  'O poste é o cateto oposto ao ângulo de 30° (no chão) e a corda é a hipotenusa. $\text{sen}(30°) = \frac{\text{poste}}{\text{corda}} \Rightarrow \frac{1}{2} = \frac{6}{\text{corda}} \Rightarrow \text{corda} = 12 \text{ m}$.',
  'hard',
  5
);

-- ============================================================
-- LIÇÕES — Módulo 4: Estatística e Probabilidade
-- ============================================================

insert into public.lessons (id, module_id, slug, title, description, order_index, xp_reward, coin_reward) values
(
  'b1b2c3d4-0401-0000-0000-000000000001',
  'a1b2c3d4-0004-0000-0000-000000000004',
  'medidas-tendencia-central',
  'Média, Mediana e Moda',
  'Calcule e interprete as principais medidas de tendência central.',
  1, 30, 8
),
(
  'b1b2c3d4-0402-0000-0000-000000000002',
  'a1b2c3d4-0004-0000-0000-000000000004',
  'probabilidade-classica',
  'Probabilidade Clássica',
  'Espaço amostral, eventos e cálculo de probabilidades simples.',
  2, 35, 10
),
(
  'b1b2c3d4-0403-0000-0000-000000000003',
  'a1b2c3d4-0004-0000-0000-000000000004',
  'analise-dados-graficos',
  'Análise de Dados e Gráficos',
  'Leitura de gráficos, dispersão de dados e desvio médio.',
  3, 35, 10
);

-- ============================================================
-- EXERCÍCIOS — Lição 4.1: Média, Mediana e Moda
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0401-0000-0000-000000000001',
  'Qual é a média aritmética do conjunto $\{4, 7, 10, 13, 16\}$?',
  null,
  'multiple_choice',
  '["8", "9", "10", "11"]',
  '10',
  'Soma = $4 + 7 + 10 + 13 + 16 = 50$. Média = $\frac{50}{5} = 10$.',
  'easy',
  1
),
(
  'b1b2c3d4-0401-0000-0000-000000000001',
  'Qual é a mediana do conjunto $\{3, 7, 2, 9, 5\}$?',
  null,
  'multiple_choice',
  '["3", "5", "7", "9"]',
  '5',
  'Ordenando: $\{2, 3, 5, 7, 9\}$. A mediana é o valor central, o 3º elemento: 5.',
  'easy',
  2
),
(
  'b1b2c3d4-0401-0000-0000-000000000001',
  'Qual é a moda do conjunto $\{1, 3, 3, 5, 7, 7, 7\}$?',
  null,
  'multiple_choice',
  '["3", "5", "7", "Não tem moda"]',
  '7',
  'A moda é o valor que aparece com maior frequência. O 7 aparece 3 vezes, mais do que qualquer outro.',
  'medium',
  3
),
(
  'b1b2c3d4-0401-0000-0000-000000000001',
  'As notas de um aluno em 5 provas foram: 6, 7, 8, 9 e $x$. A média foi 7,6. Qual é o valor de $x$?',
  null,
  'multiple_choice',
  '["6", "7", "8", "9"]',
  '8',
  '$\frac{6+7+8+9+x}{5} = 7{,}6 \Rightarrow 30 + x = 38 \Rightarrow x = 8$.',
  'medium',
  4
),
(
  'b1b2c3d4-0401-0000-0000-000000000001',
  'Os salários de 5 funcionários são: R$ 1.200, R$ 1.500, R$ 1.800, R$ 2.000 e R$ 8.500. Qual medida de tendência central representa melhor o salário típico?',
  'ENEM — a escolha da medida estatística correta é essencial para análise de dados reais.',
  'multiple_choice',
  '["Média", "Mediana", "Moda", "Todas são equivalentes"]',
  'Mediana',
  'A média seria R$ 3.000, distorcida pelo salário do diretor. A mediana (R$ 1.800) representa melhor o salário típico porque não é afetada por valores extremos (outliers).',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 4.2: Probabilidade Clássica
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0402-0000-0000-000000000002',
  'Um dado honesto é lançado. Qual é a probabilidade de sair o número 4?',
  null,
  'multiple_choice',
  '["1/3", "1/4", "1/5", "1/6"]',
  '1/6',
  'Há 6 resultados possíveis e apenas 1 é favorável. $P(4) = \frac{1}{6}$.',
  'easy',
  1
),
(
  'b1b2c3d4-0402-0000-0000-000000000002',
  'A probabilidade de uma moeda honesta cair cara é 1/2.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! Uma moeda tem 2 faces (cara e coroa) igualmente prováveis. $P(\text{cara}) = \frac{1}{2}$.',
  'easy',
  2
),
(
  'b1b2c3d4-0402-0000-0000-000000000002',
  'Uma urna contém 3 bolas vermelhas e 7 bolas azuis. Qual é a probabilidade de sortear uma bola vermelha?',
  null,
  'multiple_choice',
  '["3/7", "3/10", "7/10", "1/3"]',
  '3/10',
  'Total de bolas = $3 + 7 = 10$. Favoráveis = 3 (vermelhas). $P = \frac{3}{10}$.',
  'medium',
  3
),
(
  'b1b2c3d4-0402-0000-0000-000000000002',
  'Em um grupo de 30 alunos, 18 preferem matemática. Se um aluno é escolhido aleatoriamente, qual é a probabilidade de ele preferir matemática?',
  null,
  'multiple_choice',
  '["1/3", "2/5", "3/5", "2/3"]',
  '3/5',
  '$P = \frac{18}{30} = \frac{3}{5}$.',
  'medium',
  4
),
(
  'b1b2c3d4-0402-0000-0000-000000000002',
  'Dois dados honestos são lançados. Qual é a probabilidade de a soma dos resultados ser 7?',
  'ENEM 2015 — adaptado. Probabilidade com dois dados é um tema clássico.',
  'multiple_choice',
  '["5/36", "1/6", "7/36", "1/12"]',
  '1/6',
  'Pares que somam 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — 6 pares. Total de pares possíveis: 36. $P = \frac{6}{36} = \frac{1}{6}$.',
  'hard',
  5
);

-- ============================================================
-- EXERCÍCIOS — Lição 4.3: Análise de Dados e Gráficos
-- ============================================================

insert into public.exercises (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index) values
(
  'b1b2c3d4-0403-0000-0000-000000000003',
  'O desvio padrão mede a dispersão dos dados em relação à média.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! O desvio padrão indica o quanto os dados se afastam da média. Quanto maior o desvio, mais espalhados estão os dados.',
  'easy',
  1
),
(
  'b1b2c3d4-0403-0000-0000-000000000003',
  'Em um gráfico de barras, a altura de cada barra representa a frequência ou o valor daquela categoria.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! Em gráficos de barras (ou colunas), cada barra tem altura proporcional à frequência ou ao valor que representa.',
  'easy',
  2
),
(
  'b1b2c3d4-0403-0000-0000-000000000003',
  'A variância de um conjunto de dados é o quadrado do desvio padrão.',
  null,
  'true_false',
  null,
  'true',
  'Verdadeiro! $\text{variância} = \sigma^2$ e $\text{desvio padrão} = \sigma$, portanto variância = (desvio padrão)².',
  'medium',
  3
),
(
  'b1b2c3d4-0403-0000-0000-000000000003',
  'Em uma pesquisa, 60% dos entrevistados preferem chocolate ao morango. Se 200 pessoas foram entrevistadas, quantas preferem chocolate?',
  null,
  'multiple_choice',
  '["60", "100", "120", "140"]',
  '120',
  '$60\% \text{ de } 200 = 0{,}60 \times 200 = 120 \text{ pessoas}$.',
  'medium',
  4
),
(
  'b1b2c3d4-0403-0000-0000-000000000003',
  'As idades de 5 funcionários são: 20, 25, 30, 35 e 40 anos. Qual é o desvio médio absoluto em relação à média?',
  'ENEM — o desvio médio absoluto mede a dispersão média sem usar quadrados.',
  'multiple_choice',
  '["4", "5", "6", "8"]',
  '6',
  'Média = $\frac{20+25+30+35+40}{5} = 30$. Desvios absolutos: $|20-30|=10$, $|25-30|=5$, $|30-30|=0$, $|35-30|=5$, $|40-30|=10$. DMA = $\frac{10+5+0+5+10}{5} = \frac{30}{5} = 6$.',
  'hard',
  5
);
