import Link from 'next/link'
import Image from 'next/image'
import { LandingBackground } from '@/presentation/components/landing/LandingBackground'
import { LandingMusicPlayer } from '@/presentation/components/landing/LandingMusicPlayer'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import type { EloTier } from '@/domain/user/entities/User'
import type { LucideIcon } from 'lucide-react'
import {
  Calculator,
  Ruler,
  BarChart2,
  Puzzle,
  Trophy,
  TrendingUp,
  Lightbulb,
  Zap,
  Coins,
  Target,
  Swords,
  Sparkles,
  Heart,
  BookOpen,
} from 'lucide-react'

// DraftingCompass is not in all versions of lucide-react, use BookOpen as fallback for 📐
const AlgebraIcon = BookOpen

const modules: { icon: LucideIcon; title: string; color: string; bg: string; desc: string }[] = [
  { icon: Calculator, title: 'Números e Operações', color: '#D4845A', bg: '#D4845A18', desc: 'MMC, MDC, frações, potências' },
  { icon: AlgebraIcon, title: 'Álgebra e Funções',  color: '#6B9E7A', bg: '#6B9E7A18', desc: 'Equações, funções, progressões' },
  { icon: Ruler,      title: 'Geometria',           color: '#8B7CC4', bg: '#8B7CC418', desc: 'Plana, espacial e trigonometria' },
  { icon: BarChart2,  title: 'Estatística',         color: '#F0B429', bg: '#F0B42918', desc: 'Média, probabilidade, gráficos' },
]

const features: { icon: LucideIcon; color: string; title: string; desc: string }[] = [
  { icon: Puzzle,     color: '#D4845A', title: 'Aprenda praticando',    desc: 'Exercícios contextualizados com o estilo do ENEM. Sem decoreba — entendimento real.' },
  { icon: Trophy,     color: '#F0B429', title: 'Ganhe recompensas',     desc: 'XP, moedas e conquistas a cada lição. Seu progresso sempre visível e motivador.' },
  { icon: TrendingUp, color: '#6B9E7A', title: 'Do básico ao avançado', desc: 'Trilha progressiva que acompanha seu nível. Do fundamental ao Ensino Médio completo.' },
  { icon: Lightbulb,  color: '#8B7CC4', title: 'Explicações claras',    desc: 'Toda questão tem explicação detalhada. Errou? Entenda exatamente o porquê.' },
]

const tiers: { tier: EloTier; label: string; glow: string }[] = [
  { tier: 'bronze',   label: 'Bronze',   glow: '#CD7F32' },
  { tier: 'prata',    label: 'Prata',    glow: '#94A3B8' },
  { tier: 'ouro',     label: 'Ouro',     glow: '#F0B429' },
  { tier: 'platina',  label: 'Platina',  glow: '#67E8F9' },
  { tier: 'diamante', label: 'Diamante', glow: '#818CF8' },
  { tier: 'mestre',   label: 'Mestre',   glow: '#C084FC' },
]

const eloInfoCards: { icon: LucideIcon; title: string; desc: string; glow: string }[] = [
  { icon: Target,     title: 'Teste de classificação', desc: '15 questões que definem seu elo inicial. Precisão vale 95% da nota.', glow: '#D4845A' },
  { icon: Swords,     title: 'Partidas ranqueadas',    desc: 'Questões nível ENEM. Acerte mais e suba de divisão.', glow: '#8B7CC4' },
  { icon: TrendingUp, title: 'Evolução contínua',      desc: 'De Bronze IV a Mestre. Cada divisão conquistada é progresso real.', glow: '#6B9E7A' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: '#FAF8F4' }}>
      <LandingBackground />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-matema-border" style={{ background: 'linear-gradient(rgba(140,140,140,0.55), rgba(140,140,140,0.55)), url(/nav-texture.webp) center/cover' }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <Link href="/entrar" className="text-base font-bold transition-colors px-6 py-2.5 rounded-xl hover:bg-black/10" style={{ color: '#302c2c' }}>
              Entrar
            </Link>
            {/* Gradient border button */}
            <Link href="/cadastro">
              <span className="inline-block p-[2px] rounded-xl" style={{ background: 'linear-gradient(135deg, #D4845A, #8B7CC4)' }}>
                <span className="block bg-matema-primary text-white text-sm font-bold px-4 py-1.5 rounded-[10px] hover:opacity-90 transition-opacity">
                  Começar grátis
                </span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative">
        {/* Dot grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #D4845A20 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        {/* Gradient blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #D4845A14 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #8B7CC414 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
        {/* Floating math symbols */}
        <span className="absolute top-16 left-[6%]  text-8xl font-black select-none pointer-events-none" style={{ color: '#D4845A0D', transform: 'rotate(-15deg)' }}>π</span>
        <span className="absolute top-28 right-[8%] text-9xl font-black select-none pointer-events-none" style={{ color: '#8B7CC40D', transform: 'rotate(12deg)' }}>∑</span>
        <span className="absolute bottom-16 left-[20%] text-7xl font-black select-none pointer-events-none" style={{ color: '#6B9E7A0D', transform: 'rotate(8deg)' }}>∞</span>
        <span className="absolute top-8 right-[30%] text-6xl font-black select-none pointer-events-none" style={{ color: '#F0B4290D', transform: 'rotate(-8deg)' }}>√</span>
        <span className="absolute bottom-8 right-[5%] text-8xl font-black select-none pointer-events-none" style={{ color: '#D4845A0A', transform: 'rotate(20deg)' }}>∫</span>

        {/* Logo — ocupa a viewport inteira, resto só com scroll */}
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Image src="/matema-logo-landing.webp" alt="Matema" width={600} height={600} className="w-[360px] md:w-[520px] h-auto drop-shadow-md" priority />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-4 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 border" style={{ background: 'linear-gradient(135deg,#D4845A12,#8B7CC412)', borderColor: '#D4845A35' }}>
            <Sparkles className="w-4 h-4 text-matema-primary" strokeWidth={1.75} />
            <span className="text-sm font-bold text-matema-primary">Gratuito para começar</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-[3.75rem] font-extrabold text-matema-dark leading-tight mb-6 tracking-tight">
            Aprenda matemática<br />
            <span style={{ backgroundImage: 'linear-gradient(135deg,#D4845A 0%,#8B7CC4 55%,#6B9E7A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              se divertindo!
            </span>
          </h1>

          <p className="text-lg md:text-xl text-matema-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Do fundamental ao Ensino Médio, com foco no ENEM.<br />
            Exercícios, recompensas e uma trilha feita para você evoluir.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro">
              <span className="inline-block p-[2.5px] rounded-2xl" style={{ background: 'linear-gradient(135deg,#D4845A,#8B7CC4,#6B9E7A)' }}>
                <span className="flex items-center gap-2 bg-matema-primary text-white font-extrabold text-base px-8 py-4 rounded-[13px] hover:opacity-90 transition-opacity">
                  Começar agora — é grátis
                </span>
              </span>
            </Link>
            <Link href="/entrar" className="font-semibold text-matema-muted hover:text-matema-dark transition-colors px-6 py-4 rounded-2xl border-2 border-matema-border hover:border-matema-primary/40 hover:bg-matema-warm">
              Já tenho conta →
            </Link>
          </div>

          {/* UI Preview */}
          <div className="mt-16">
            <div className="relative max-w-sm mx-auto">
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg,#D4845A30,#8B7CC430)', filter: 'blur(24px)', transform: 'scale(0.9) translateY(12px)' }} />
              <div className="relative rounded-3xl shadow-xl p-6" style={{ background: '#1E1A14', border: '1px solid #3A3020' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm" style={{ background: 'linear-gradient(135deg,#D4845A,#8B7CC4)' }}>A</div>
                    <div className="text-left">
                      <p className="font-bold text-sm" style={{ color: '#F0E8D8' }}>Ana Silva</p>
                      <p className="text-xs" style={{ color: '#9B9188' }}>Nível 4 · 320 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: '#D4845A', background: 'rgba(212,132,90,0.15)' }}>
                      <Zap className="w-3.5 h-3.5 text-yellow-400" strokeWidth={1.75} />
                      320
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: '#F0B429', background: 'rgba(240,180,41,0.15)' }}>
                      <Coins className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} />
                      85
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl p-4 mb-4" style={{ background: '#2A2018', border: '1px solid #3A3020' }}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs" style={{ color: '#9B9188' }}>Questão 3 de 5</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>Fácil</span>
                  </div>
                  <div className="w-full rounded-full h-1.5 mb-3 overflow-hidden" style={{ background: '#3A3020' }}>
                    <div className="h-full rounded-full" style={{ width: '40%', background: 'linear-gradient(to right,#D4845A,#8B7CC4)' }} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#F0E8D8' }}>Qual é o MMC de 12 e 18?</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['6', '36', '72', '24'].map((opt, i) => (
                    <div key={opt} className="p-3 rounded-xl border-2 text-sm font-bold text-center"
                      style={i === 1
                        ? { background: 'linear-gradient(135deg,#D4845A,#8B7CC4)', borderColor: 'transparent', color: '#fff' }
                        : { borderColor: '#3A3020', color: '#C8BFB5', background: '#2A2018' }}
                    >{opt}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ──────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundImage: 'url(/backgrounds/arte-fundo-matema.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2" style={{ color: '#F0E8D8' }}>Trilha completa para o ENEM</h2>
          <p className="text-center mb-10" style={{ color: '#C8BFB5' }}>4 módulos com dezenas de lições e exercícios contextualizados</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modules.map((m) => {
              const Icon = m.icon
              return (
                <div key={m.title} className="rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)', border: `2px solid ${m.color}60` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: m.color }}>
                    <Icon className="w-7 h-7" style={{ color: '#ffffff' }} strokeWidth={1.75} />
                  </div>
                  <p className="font-bold text-sm mb-1" style={{ color: '#F0E8D8' }}>{m.title}</p>
                  <p className="text-xs" style={{ color: '#C8BFB5' }}>{m.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundImage: 'url(/backgrounds/arte-fundo-matema.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10" style={{ color: '#F0E8D8' }}>Por que o Matema é diferente?</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-3xl p-6 flex gap-4 hover:-translate-y-0.5 transition-transform" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)', border: `1.5px solid rgba(255,255,255,0.1)`, borderLeft: `4px solid ${f.color}` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: f.color }}>
                  <Icon className="w-6 h-6" style={{ color: '#ffffff' }} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: '#F0E8D8' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#C8BFB5' }}>{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        </div>
      </section>

      {/* ── ELO / RANKING ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 mx-4 mb-6 rounded-4xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#1E1728 0%,#12141C 60%,#1A2018 100%)' }}>
        {/* Background glow spots */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,#8B7CC420 0%,transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,#D4845A18 0%,transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4" style={{ background: '#ffffff10', color: '#C084FC', border: '1px solid #C084FC30' }}>
              Modo Competitivo
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 flex items-center justify-center gap-3">
              Sistema de Elos
              <Trophy className="w-8 h-8 text-yellow-500" strokeWidth={1.75} />
            </h2>
            <p className="max-w-md mx-auto leading-relaxed" style={{ color: '#94A3B8' }}>
              Faça o teste de classificação e descubra onde você está. Jogue ranqueadas com questões ENEM para subir de divisão.
            </p>
          </div>

          {/* Tier badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tiers.map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl transition-transform hover:-translate-y-1"
                style={{ background: '#ffffff08', border: `1px solid ${t.glow}30`, boxShadow: `0 0 20px ${t.glow}15` }}>
                <EloTierIcon tier={t.tier} size="w-10 h-10" />
                <span className="text-xs font-bold" style={{ color: t.glow }}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Info cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {eloInfoCards.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.title} className="rounded-2xl p-5" style={{ background: '#ffffff07', border: `1px solid ${c.glow}25` }}>
                  <div className="mb-3">
                    <Icon className="w-6 h-6" style={{ color: c.glow }} strokeWidth={1.75} />
                  </div>
                  <p className="font-bold text-white text-sm mb-1">{c.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-4 mb-16 rounded-4xl py-16 px-6 text-center max-w-5xl md:mx-auto relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#D4845A 0%,#C4749A 50%,#8B7CC4 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute -bottom-12 -right-8 w-52 h-52 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute top-4 right-20 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="relative">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Comece hoje</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Pronto para<br />começar?
          </h2>
          <p className="text-white/80 mb-10 text-lg max-w-md mx-auto">
            Crie sua conta gratuita e faça o teste de classificação hoje mesmo.
          </p>
          <Link href="/cadastro">
            <span className="inline-flex items-center gap-2 bg-white font-extrabold text-base px-10 py-4 rounded-2xl hover:bg-matema-cream transition-colors" style={{ color: '#D4845A' }}>
              Criar conta grátis
            </span>
          </Link>
        </div>
      </section>

      {/* ── MUSIC PLAYER ─────────────────────────────────────────────────── */}
      <LandingMusicPlayer />

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-matema-border py-8 text-center text-sm text-matema-muted">
        <p className="flex items-center justify-center gap-1.5">
          © 2026 Matema. Feito com
          <Heart className="w-4 h-4 text-yellow-500 fill-yellow-400" strokeWidth={1.75} />
          para quem quer aprender matemática de verdade.
        </p>
      </footer>
    </div>
  )
}
