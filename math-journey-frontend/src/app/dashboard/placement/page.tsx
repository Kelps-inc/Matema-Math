import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MathText } from '@/presentation/components/ui/MathText'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import type { PlacementResult } from '@/app/actions/elo'
import { CheckCircle2, XCircle, Lightbulb, Zap, Trophy } from 'lucide-react'

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
}
const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'text-green-700 bg-green-50 border-green-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  hard:   'text-red-700   bg-red-50   border-red-200',
}

function fmtTime(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}min ${rem}s`
}

export default async function PlacementResultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('placement_completed, placement_result, elo_tier, elo_division')
    .eq('id', user.id)
    .single()

  if (!profile?.placement_completed || !profile?.placement_result) {
    redirect('/ranqueada/placement')
  }

  const result = profile.placement_result as PlacementResult
  const tier = profile.elo_tier as EloTier
  const division = profile.elo_division as number
  const divLabel = tier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][division] ?? division}`

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-matema-muted hover:text-matema-dark mb-6 transition-colors"
      >
        ← Voltar ao Progresso
      </Link>

      <h1 className="text-2xl font-extrabold text-matema-dark mb-6">Resultado do Teste de Nivelamento</h1>

      {/* Summary card */}
      <div className="bg-white rounded-3xl border border-matema-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <EloTierIcon tier={tier} size="w-12 h-12" />
          <div>
            <p className="text-xs text-matema-muted uppercase tracking-wide font-medium">Elo classificado</p>
            <p className="text-2xl font-extrabold text-matema-dark">{ELO_TIER_LABELS[tier]}{divLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat label="Pontuação" value={`${result.score}/100`} />
          <Stat label="Precisão" value={`${result.accuracy}%`} />
          <Stat label="Acertos" value={`${result.correct}/${result.total}`} />
          <Stat label="Tempo total" value={fmtTime(result.totalTimeMs)} />
        </div>

        <div className="mt-4 pt-4 border-t border-matema-border flex gap-6 text-xs text-matema-muted">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-500" strokeWidth={1.75} />
            Precisão: <strong className="text-matema-dark ml-1">{result.accuracy}% × 95%</strong>
          </span>
          <span>Velocidade: <strong className="text-matema-dark">{result.timeBonus}% × 5%</strong></span>
        </div>
      </div>

      {/* Q&A review */}
      <h2 className="text-lg font-bold text-matema-dark mb-4">Questão por questão</h2>
      <div className="space-y-4">
        {result.answers.map((a, i) => (
          <div
            key={a.questionId}
            className={`bg-white rounded-2xl border-2 p-5 ${
              a.isCorrect ? 'border-green-200' : 'border-red-200'
            }`}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {a.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={1.75} />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" strokeWidth={1.75} />
              )}
              <span className="text-xs font-bold text-matema-muted">#{i + 1}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[a.difficulty] ?? ''}`}>
                {DIFFICULTY_LABEL[a.difficulty] ?? a.difficulty}
              </span>
              <span className="text-xs text-matema-muted">{a.topic}</span>
              <span className="ml-auto text-xs text-matema-muted tabular-nums">{fmtTime(a.timeMs)}</span>
            </div>

            {/* Question */}
            <p className="font-semibold text-matema-dark text-sm mb-3 leading-relaxed">
              <MathText>{a.question}</MathText>
            </p>

            {/* Answer comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
              <div className={`rounded-xl px-3 py-2 ${a.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span className="font-semibold block text-xs mb-0.5 opacity-70">Sua resposta</span>
                <MathText>{a.answer}</MathText>
              </div>
              {!a.isCorrect && (
                <div className="rounded-xl px-3 py-2 bg-green-50 text-green-800">
                  <span className="font-semibold block text-xs mb-0.5 opacity-70">Resposta correta</span>
                  <MathText>{a.correctAnswer}</MathText>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="text-xs text-matema-muted leading-relaxed flex items-start gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <MathText>{a.explanation}</MathText>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/ranqueada"
          className="flex-1 text-center bg-matema-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Jogar Ranqueada
          <Trophy className="w-5 h-5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-matema-cream rounded-2xl p-3 text-center">
      <p className="text-lg font-extrabold text-matema-dark leading-none">{value}</p>
      <p className="text-xs text-matema-muted mt-0.5">{label}</p>
    </div>
  )
}
