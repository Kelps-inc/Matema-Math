import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'

const LESSON_ID = 'c1b2c3d4-0504-0000-0000-000000000004'

const DIFF_STYLE: Record<string, string> = {
  easy:   'color:#15803d;background:#dcfce7;border:1px solid #86efac',
  medium: 'color:#b45309;background:#fef3c7;border:1px solid #fcd34d',
  hard:   'color:#b91c1c;background:#fee2e2;border:1px solid #fca5a5',
}
const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

export default async function PreviewQuestoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exercises } = await (supabase as any)
    .from('exercises')
    .select('id, order_index, question, context, options, correct_answer, explanation, difficulty, source')
    .eq('lesson_id', LESSON_ID)
    .order('order_index')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list: any[] = exercises ?? []
  const easy   = list.filter(e => e.difficulty === 'easy').length
  const medium = list.filter(e => e.difficulty === 'medium').length
  const hard   = list.filter(e => e.difficulty === 'hard').length

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui,sans-serif', color: '#1a1a2e' }}>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 4 }}>Admin · Preview</p>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Banco — Estilo ENEM</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>
        {list.length} questões ·{' '}
        <span style={{ color: '#15803d', fontWeight: 600 }}>{easy} fáceis</span> ·{' '}
        <span style={{ color: '#b45309', fontWeight: 600 }}>{medium} médias</span> ·{' '}
        <span style={{ color: '#b91c1c', fontWeight: 600 }}>{hard} difíceis</span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {list.map((ex) => {
          const isSvg = typeof ex.context === 'string' && ex.context.trimStart().startsWith('<svg')
          const options: string[] = Array.isArray(ex.options) ? ex.options : []
          const correct = (ex.correct_answer ?? '').trim().toLowerCase()

          return (
            <div key={ex.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e0d8', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                <span style={{ background: '#f5f0e8', border: '1px solid #e0d9ce', borderRadius: 9999, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: '#888' }}>
                  Q{String(ex.order_index).padStart(2, '0')}
                </span>
                <span style={{ borderRadius: 9999, padding: '2px 10px', fontSize: 12, fontWeight: 600, ...Object.fromEntries((DIFF_STYLE[ex.difficulty] ?? '').split(';').map(s => { const [k, v] = s.split(':'); return [k?.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v?.trim()] }).filter(([k]) => k)) }}>
                  {DIFF_LABEL[ex.difficulty] ?? ex.difficulty}
                </span>
                <span style={{ fontSize: 12, color: '#999', background: '#f9f9f9', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '2px 10px' }}>
                  {ex.source ?? '—'}
                </span>
                {isSvg && (
                  <span style={{ fontSize: 12, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 9999, padding: '2px 10px', fontWeight: 600 }}>
                    🖼 SVG
                  </span>
                )}
              </div>

              {/* Contexto */}
              {ex.context && (
                <div style={{ background: '#f5f0e8', borderRadius: 12, padding: 12, marginBottom: 12, border: '1px solid #e0d9ce', overflowX: 'auto' }}>
                  {isSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: ex.context }} />
                  ) : (
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{ex.context}</p>
                  )}
                </div>
              )}

              {/* Enunciado */}
              <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{ex.question}</p>

              {/* Alternativas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {options.map((opt, i) => {
                  const isCorrect = opt.trim().toLowerCase() === correct
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 8, alignItems: 'center',
                      padding: '10px 14px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                      border: isCorrect ? '2px solid #4ade80' : '2px solid #e5e7eb',
                      background: isCorrect ? '#f0fdf4' : 'white',
                      color: isCorrect ? '#15803d' : '#555',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, width: 16, textAlign: 'center', flexShrink: 0 }}>
                        {['A','B','C','D','E'][i]}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isCorrect && <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 'auto' }}>✓</span>}
                    </div>
                  )
                })}
              </div>

              {/* Explicação */}
              {ex.explanation && (
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', cursor: 'pointer' }}>
                    💡 Ver explicação
                  </summary>
                  <p style={{ marginTop: 8, fontSize: 12, color: '#666', background: '#f5f0e8', borderRadius: 10, padding: 12, border: '1px solid #e0d9ce', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {ex.explanation}
                  </p>
                </details>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
