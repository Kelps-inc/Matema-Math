import Link from 'next/link'
import { Button } from '@/presentation/components/ui/Button'

const features = [
  {
    icon: '🧩',
    title: 'Aprenda praticando',
    desc: 'Exercícios contextualizados com o estilo do ENEM. Sem decoreba — entendimento real.',
  },
  {
    icon: '🏆',
    title: 'Ganhe recompensas',
    desc: 'XP, moedas e conquistas a cada lição. Seu progresso sempre visível e motivador.',
  },
  {
    icon: '📈',
    title: 'Do básico ao avançado',
    desc: 'Trilha progressiva que acompanha seu nível. Do fundamental ao Ensino Médio completo.',
  },
  {
    icon: '💡',
    title: 'Explicações claras',
    desc: 'Toda questão tem explicação detalhada. Errou? Entenda exatamente o porquê.',
  },
]

const modules = [
  { icon: '🔢', title: 'Números e Operações', color: '#D4845A', desc: 'MMC, MDC, frações, potências' },
  { icon: '📐', title: 'Álgebra e Funções', color: '#6B9E7A', desc: 'Equações, funções, progressões' },
  { icon: '📏', title: 'Geometria', color: '#8B7CC4', desc: 'Plana, espacial e trigonometria' },
  { icon: '📊', title: 'Estatística', color: '#F0B429', desc: 'Média, probabilidade, gráficos' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="bg-matema-cream/90 backdrop-blur-md border-b border-matema-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-matema-dark">
            <span className="text-2xl">📐</span>
            <span className="text-matema-primary">Matema</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              className="text-sm font-semibold text-matema-muted hover:text-matema-dark transition-colors px-4 py-2 rounded-xl hover:bg-matema-warm"
            >
              Entrar
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-matema-primary/10 border border-matema-primary/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm">✨</span>
          <span className="text-sm font-semibold text-matema-primary">Gratuito para começar</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-matema-dark leading-tight mb-6">
          Aprenda matemática<br />
          <span className="text-matema-primary">do jeito que faz sentido</span>
        </h1>

        <p className="text-lg md:text-xl text-matema-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Do fundamental ao Ensino Médio, com foco no ENEM.<br />
          Exercícios, recompensas e uma trilha feita para você evoluir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/cadastro">
            <Button size="lg" className="min-w-48">
              Começar agora — é grátis
            </Button>
          </Link>
          <Link href="/entrar">
            <Button variant="ghost" size="lg" className="min-w-48">
              Já tenho conta
            </Button>
          </Link>
        </div>

        {/* Preview da UI */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-3xl border border-matema-border shadow-xl shadow-matema-dark/8 p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-matema-primary/10 rounded-full flex items-center justify-center font-bold text-matema-primary">A</div>
                <div>
                  <p className="font-bold text-matema-dark text-sm">Ana Silva</p>
                  <p className="text-xs text-matema-muted">Nível 4 · 320 XP</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="text-matema-primary">⚡ 320</span>
                <span className="text-amber-600">🪙 85</span>
              </div>
            </div>

            <div className="bg-matema-cream rounded-2xl p-4 mb-4">
              <p className="text-xs text-matema-muted mb-1">Questão 3 de 5</p>
              <div className="w-full bg-matema-warm rounded-full h-2 mb-3">
                <div className="bg-matema-primary h-2 rounded-full" style={{ width: '40%' }} />
              </div>
              <p className="font-semibold text-matema-dark">Qual é o MMC de 12 e 18?</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['6', '36', '72', '24'].map((opt, i) => (
                <div key={opt} className={`p-3 rounded-xl border-2 text-sm font-medium text-center cursor-pointer transition-colors
                  ${i === 1 ? 'border-matema-primary bg-matema-primary/5 text-matema-primary' : 'border-matema-border text-matema-dark hover:border-matema-primary/30'}`}>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="bg-matema-warm border-y border-matema-border py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-matema-dark text-center mb-3">
            Trilha completa para o ENEM
          </h2>
          <p className="text-matema-muted text-center mb-10">
            4 módulos com dezenas de lições e exercícios contextualizados
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modules.map((m) => (
              <div key={m.title} className="bg-white rounded-2xl p-5 border border-matema-border text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  {m.icon}
                </div>
                <p className="font-bold text-matema-dark text-sm mb-1">{m.title}</p>
                <p className="text-xs text-matema-muted">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-matema-dark text-center mb-10">
          Por que o Matema é diferente?
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-3xl p-6 border border-matema-border flex gap-4">
              <div className="w-12 h-12 bg-matema-primary/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-matema-dark mb-1">{f.title}</h3>
                <p className="text-sm text-matema-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ELO / RANKING */}
      <section className="bg-matema-warm border-y border-matema-border py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-3">
              Sistema de Elos 🏆
            </h2>
            <p className="text-matema-muted max-w-xl mx-auto">
              Faça o teste de classificação e descubra seu elo. Jogue partidas ranqueadas com questões estilo ENEM para subir de divisão.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: '🥉', label: 'Bronze',   color: 'border-orange-200 bg-orange-50'  },
              { icon: '🥈', label: 'Prata',    color: 'border-slate-200  bg-slate-50'   },
              { icon: '🥇', label: 'Ouro',     color: 'border-yellow-200 bg-yellow-50'  },
              { icon: '💎', label: 'Platina',  color: 'border-cyan-200   bg-cyan-50'    },
              { icon: '💠', label: 'Diamante', color: 'border-blue-200   bg-blue-50'    },
              { icon: '🔮', label: 'Mestre',   color: 'border-purple-200 bg-purple-50'  },
            ].map((tier) => (
              <div key={tier.label} className={`flex flex-col items-center gap-1 border-2 rounded-2xl px-5 py-4 ${tier.color}`}>
                <span className="text-3xl">{tier.icon}</span>
                <span className="text-xs font-bold text-matema-dark">{tier.label}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
            <div className="bg-white rounded-2xl border border-matema-border p-5 flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold text-matema-dark mb-1">Teste de classificação</p>
                <p className="text-matema-muted text-xs">15 questões que definem seu elo inicial. Precisão vale 95% da nota.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-matema-border p-5 flex gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="font-bold text-matema-dark mb-1">Partidas ranqueadas</p>
                <p className="text-matema-muted text-xs">Questões nível ENEM. Acerte mais e suba de divisão — seu elo nunca cai.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-matema-border p-5 flex gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-bold text-matema-dark mb-1">Evolução contínua</p>
                <p className="text-matema-muted text-xs">De Bronze IV a Mestre. Cada divisão conquistada mostra seu crescimento real.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-matema-primary mx-4 mb-16 rounded-4xl py-14 px-6 text-center max-w-5xl md:mx-auto">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
          Pronto para começar?
        </h2>
        <p className="text-white/80 mb-8 text-lg">
          Crie sua conta gratuita e comece sua jornada agora.
        </p>
        <Link href="/cadastro">
          <Button
            className="bg-white text-matema-primary hover:bg-matema-cream min-w-48"
            size="lg"
          >
            Criar conta grátis
          </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-matema-border py-8 text-center text-sm text-matema-muted">
        <p>© 2026 Matema. Feito com 💛 para quem quer aprender matemática de verdade.</p>
      </footer>
    </div>
  )
}
