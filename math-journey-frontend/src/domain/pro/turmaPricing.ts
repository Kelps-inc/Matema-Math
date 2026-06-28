/**
 * Precificação do Plano Turma (Sala de Aula) — camada de domínio, pura.
 *
 * Zero imports de Supabase/Next/React. A mesma regra existe na migration
 * `006_turma_plans.sql` (comentário) — mantenha as duas sincronizadas.
 *
 * Regra:
 *   unidade = R$ 14,90/aluno/mês (1490 centavos)
 *   desconto = 20% off para até 49 alunos; 25% off a partir de 50
 *   total = round(1490 × N × fator × meses)
 */

/** Preço cheio por aluno/mês, em centavos. */
export const PRO_UNIT_PRICE_CENTS = 1490

/** Períodos (em meses) que o responsável pode contratar num único PIX. */
export const TURMA_MONTH_OPTIONS = [1, 3, 6, 12] as const
export type TurmaMonths = (typeof TURMA_MONTH_OPTIONS)[number]

/** Limites de tamanho da turma. */
export const TURMA_MIN_SEATS = 2
export const TURMA_MAX_SEATS = 2000

/** Limiar a partir do qual o desconto sobe para 25%. */
export const TURMA_BULK_THRESHOLD = 50

export interface TurmaQuote {
  seats: number
  months: TurmaMonths
  unitPriceCents: number
  /** Percentual de desconto aplicado (20 ou 25). */
  discountPct: number
  /** Preço por aluno/mês já com desconto, em centavos. */
  discountedUnitCents: number
  /** Valor total da cobrança, em centavos. */
  totalCents: number
}

/** Percentual de desconto (20 ou 25) conforme o tamanho da turma. */
export function turmaDiscountPct(seats: number): number {
  return seats >= TURMA_BULK_THRESHOLD ? 25 : 20
}

function isValidMonths(months: number): months is TurmaMonths {
  return (TURMA_MONTH_OPTIONS as readonly number[]).includes(months)
}

/**
 * Calcula a cotação da turma. Lança erro se seats/months forem inválidos —
 * a validação de borda fica na Server Action (Zod); aqui é a regra de negócio.
 */
export function quoteTurma(seats: number, months: number): TurmaQuote {
  if (!Number.isInteger(seats) || seats < TURMA_MIN_SEATS || seats > TURMA_MAX_SEATS) {
    throw new Error(`Número de alunos inválido (de ${TURMA_MIN_SEATS} a ${TURMA_MAX_SEATS}).`)
  }
  if (!isValidMonths(months)) {
    throw new Error('Período inválido.')
  }

  const discountPct = turmaDiscountPct(seats)
  const factor = (100 - discountPct) / 100
  const discountedUnitCents = Math.round(PRO_UNIT_PRICE_CENTS * factor)
  const totalCents = Math.round(PRO_UNIT_PRICE_CENTS * seats * factor * months)

  return {
    seats,
    months,
    unitPriceCents: PRO_UNIT_PRICE_CENTS,
    discountPct,
    discountedUnitCents,
    totalCents,
  }
}

/** Centavos → "R$ 1.234,56" para exibição. */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
