-- ============================================================
-- MATEMA — Seed de conteúdo v3
-- Insere exercícios na lição ranqueada-enem já existente.
-- Módulo e lição NÃO são recriados (já existem no banco).
-- ============================================================

do $$
declare
  licao_id uuid;
  next_idx integer;
begin
  -- Resolve o ID da lição existente
  select l.id into licao_id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where l.slug = 'ranqueada-enem'
    and m.slug = 'ranqueada';

  -- Próximo order_index disponível
  select coalesce(max(order_index), 0) into next_idx
  from public.exercises
  where lesson_id = licao_id;

  -- Q01 — Barras de cereal (original Matema)
  insert into public.exercises
    (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index)
  values (
    licao_id,
    'A quantidade mínima de caixas de barra de cereal necessárias para prover o suprimento a esse casal é',
    'Alguns estudos comprovam que os carboidratos fornecem energia ao corpo e ajudam na recuperação muscular durante a prática de atividade física. O ideal é consumir 2 gramas de carboidrato para cada minuto de corrida. Um casal de corredores realizará diariamente 25 minutos de corrida, ingerindo, antes da atividade, a quantidade ideal de carboidratos recomendada. Para garantir esse consumo apenas por meio de barras de cereal, o casal planeja providenciar o suprimento para um período de 20 dias ininterruptos. Sabe-se que cada caixa dessa barra vem com 12 unidades, e que cada barra tem 25 gramas de carboidratos.',
    'multiple_choice',
    '["2", "5", "7", "9", "12"]',
    '7',
    'Consumo por pessoa: 2 g/min × 25 min = 50 g. Casal: 50 × 2 = 100 g/dia. Total em 20 dias: 100 × 20 = 2.000 g. Barras: 2.000 ÷ 25 = 80. Caixas: 80 ÷ 12 = 6,67 → arredonda para cima = 7 caixas (não é possível comprar fração de caixa).',
    'medium',
    next_idx + 1
  );

  -- Q02 — Escala do instrumento de voo (ENEM 2023)
  insert into public.exercises
    (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index)
  values (
    licao_id,
    'A tela do instrumento abaixo registra o voo de uma aeronave cuja maior altitude alcançada foi de 5 km. Cada quadradinho da malha tem lado igual a 1 cm. A escala em que essa tela representa as medidas reais é',
    '<svg viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;display:block;background:#fff;border-radius:6px"><rect width="340" height="160" fill="white" rx="6"/><line x1="35" y1="15" x2="315" y2="15" stroke="#e0e0e0" stroke-width="0.5"/><line x1="35" y1="35" x2="315" y2="35" stroke="#e0e0e0" stroke-width="0.5"/><line x1="35" y1="55" x2="315" y2="55" stroke="#e0e0e0" stroke-width="0.5"/><line x1="35" y1="75" x2="315" y2="75" stroke="#e0e0e0" stroke-width="0.5"/><line x1="35" y1="95" x2="315" y2="95" stroke="#D4845A" stroke-width="1" stroke-dasharray="4,3"/><line x1="35" y1="115" x2="315" y2="115" stroke="#888" stroke-width="1.2"/><line x1="35" y1="15" x2="35" y2="115" stroke="#888" stroke-width="1.2"/><line x1="55" y1="15" x2="55" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="75" y1="15" x2="75" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="95" y1="15" x2="95" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="115" y1="15" x2="115" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="135" y1="15" x2="135" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="155" y1="15" x2="155" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="175" y1="15" x2="175" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="195" y1="15" x2="195" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="215" y1="15" x2="215" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="235" y1="15" x2="235" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="255" y1="15" x2="255" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="275" y1="15" x2="275" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="295" y1="15" x2="295" y2="115" stroke="#e0e0e0" stroke-width="0.5"/><line x1="315" y1="15" x2="315" y2="115" stroke="#888" stroke-width="1.2"/><path d="M 35 115 C 100 88 215 88 315 115" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="95" x2="26" y2="115" stroke="#444" stroke-width="1.2"/><line x1="22" y1="95" x2="30" y2="95" stroke="#444" stroke-width="1.2"/><line x1="22" y1="115" x2="30" y2="115" stroke="#444" stroke-width="1.2"/><text x="20" y="106" text-anchor="end" font-size="9" fill="#333" font-family="Arial,sans-serif">1 cm</text><text x="36" y="11" text-anchor="start" font-size="9" fill="#999" font-family="Arial,sans-serif">altitude</text><text x="175" y="133" text-anchor="middle" font-size="10" fill="#666" font-family="Arial,sans-serif">distância em solo</text><text x="175" y="147" text-anchor="middle" font-size="8" fill="#bbb" font-family="Arial,sans-serif">(lado de cada quadradinho = 1 cm)</text></svg>',
    'multiple_choice',
    '["1:5", "1:11", "1:55", "1:5.000", "1:500.000"]',
    '1:500.000',
    'A maior altitude (5 km) corresponde a 1 quadradinho = 1 cm no instrumento. Convertendo: 5 km = 5 × 100.000 cm = 500.000 cm. Escala = 1 cm (instrumento) : 500.000 cm (real) → 1:500.000.',
    'hard',
    next_idx + 2
  );

  -- Q03 — Desconto em cadernos (original Matema)
  insert into public.exercises
    (lesson_id, question, context, type, options, correct_answer, explanation, difficulty, order_index)
  values (
    licao_id,
    'O desconto necessário no preço final da compra, em porcentagem, pertence ao intervalo',
    'A cada bimestre, o diretor de uma escola compra uma quantidade de cadernos pautados proporcional ao número de alunos matriculados. No bimestre passado, ele comprou 3.000 cadernos para 750 alunos matriculados. Neste bimestre, alguns alunos se transferiram e a escola tem agora 690 alunos. O diretor só pode gastar R$ 452,00 nessa compra, e sabe que o fornecedor vende os cadernos em pacotes de 50 unidades a R$ 9,00 o pacote. Será preciso convencer o fornecedor a dar um desconto, de modo que seja possível comprar a quantidade total de cadernos necessária para o bimestre.',
    'multiple_choice',
    '["(5,0 ; 5,5)", "(7,5 ; 8,0)", "(10,0 ; 10,5)", "(15,0 ; 15,5)", "(20,0 ; 20,5)"]',
    '(10,0 ; 10,5)',
    'Proporção: 3.000 ÷ 750 = 4 cadernos/aluno. Necessário: 690 × 4 = 2.760 cadernos. Pacotes: 2.760 ÷ 50 = 55,2 → 56 pacotes (arredonda para cima). Custo sem desconto: 56 × R$9,00 = R$504,00. Desconto: (504 − 452) ÷ 504 = 52/504 ≈ 10,32% → intervalo (10,0 ; 10,5).',
    'hard',
    next_idx + 3
  );

end $$;
