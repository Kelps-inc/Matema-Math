// Aproximação TRI do ENEM — Matemática (faixa 338–900).
//
// Dois componentes:
//  1. Base: curva de potência sobre a taxa de acerto (50% ≈ 520, 0% = piso, 100% = teto)
//  2. Penalidade de inconsistência: quem erra as fáceis e acerta as difíceis viola
//     a ordem esperada fácil ≥ médio ≥ difícil e recebe desconto proporcional à inversão.
//
// ENEM_FLOOR reflete o piso real do exame (nota mínima mesmo com 0 acertos, por causa
// da TRI); ENEM_CEIL é o teto prático observado em provas de Matemática.
export const ENEM_FLOOR = 338
export const ENEM_CEIL  = 900

// Expoente calibrado para: 0% → 338, 50% → ~520, 100% → 900
const ENEM_EXP = 1.63

export interface GradedAnswer {
  exerciseId: string
  isCorrect: boolean
}

export function estimateEnemScore(
  answers: GradedAnswer[],
  difficultyMap: Record<string, 'easy' | 'medium' | 'hard'>,
): number {
  if (answers.length === 0) return ENEM_FLOOR

  const correct = answers.filter((a) => a.isCorrect).length
  const span    = ENEM_CEIL - ENEM_FLOOR

  const base = Math.round(ENEM_FLOOR + span * Math.pow(correct / answers.length, ENEM_EXP))

  let easyRight = 0, easyTotal = 0
  let medRight  = 0, medTotal  = 0
  let hardRight = 0, hardTotal = 0

  for (const a of answers) {
    const diff = difficultyMap[a.exerciseId] ?? 'medium'
    if (diff === 'easy')        { easyTotal++; if (a.isCorrect) easyRight++ }
    else if (diff === 'medium') { medTotal++;  if (a.isCorrect) medRight++ }
    else                        { hardTotal++; if (a.isCorrect) hardRight++ }
  }

  const easyAcc = easyTotal > 0 ? easyRight / easyTotal : null
  const medAcc  = medTotal  > 0 ? medRight  / medTotal  : null
  const hardAcc = hardTotal > 0 ? hardRight / hardTotal : null

  const v1 = easyAcc != null && hardAcc != null ? Math.max(0, hardAcc - easyAcc) : 0
  const v2 = medAcc  != null && hardAcc != null ? Math.max(0, hardAcc - medAcc)  : 0
  const penalty = Math.round((v1 * 0.7 + v2 * 0.3) * 200)

  return Math.max(ENEM_FLOOR, base - penalty)
}

export function enemScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score <= 400) return { label: 'Muito abaixo da média', color: 'text-red-600',    bg: 'bg-red-50    border-red-200'    }
  if (score <  520) return { label: 'Abaixo da média',       color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' }
  if (score <  620) return { label: 'Na média',               color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200'  }
  if (score <  720) return { label: 'Acima da média',         color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200'   }
  if (score <  820) return { label: 'Muito bom',              color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' }
  return                 { label: 'Excelente',                 color: 'text-green-600',  bg: 'bg-green-50  border-green-200'  }
}
