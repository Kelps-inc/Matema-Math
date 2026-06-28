'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { cn } from '@/presentation/lib/utils'
import { resetProgressAction, deleteAccountAction } from '@/app/actions/account'
import { cancelProSubscriptionAction } from '@/app/actions/pro'
import {
  Music,
  CloudRain,
  Bell,
  Moon,
  Sun,
  AlertTriangle,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Volume2,
  VolumeX,
  Crown,
  CreditCard,
} from 'lucide-react'

export interface SubscriptionInfo {
  isAdmin: boolean
  hasPro: boolean
  status: 'none' | 'trial' | 'active' | 'cancelled'
  proUntil: string | null
  hasActiveSubscription: boolean
}

function Toggle({ enabled, onToggle, label, description, icon }: {
  enabled: boolean
  onToggle: () => void
  label: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center">{icon}</div>
        <div>
          <p className="font-semibold text-matema-dark text-sm">{label}</p>
          <p className="text-xs text-matema-muted mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={enabled}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none',
          enabled ? 'bg-matema-primary' : 'bg-matema-border',
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          enabled ? 'translate-x-6' : 'translate-x-0',
        )} />
      </button>
    </div>
  )
}

function SettingRow({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-matema-border">{children}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-matema-border overflow-hidden mb-4">
      <div className="px-6 py-3 bg-matema-warm border-b border-matema-border">
        <p className="text-xs font-bold text-matema-muted uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-6">
        <SettingRow>{children}</SettingRow>
      </div>
    </div>
  )
}

export function SettingsClient({ subscription }: { subscription?: SubscriptionInfo }) {
  const [music,        setMusic]        = useState(false)
  const [musicTrack,   setMusicTrack]   = useState<string>('default')
  const [musicVolume,  setMusicVolume]  = useState(50)
  const [rain,         setRain]         = useState(false)
  const [rainVolume,   setRainVolume]   = useState(50)
  const [sfx,          setSfx]          = useState(true)
  const [sfxVolume,    setSfxVolume]    = useState(50)
  const [dark,      setDark]      = useState(false)
  const [confirmReset,  setConfirmReset]  = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Lê preferências do localStorage na montagem
  useEffect(() => {
    // default: música habilitada com Washed Dreams para novos usuários
    const storedMusic = localStorage.getItem('matema_music_enabled')
    setMusic(storedMusic === null ? true : storedMusic === 'true')
    setMusicTrack(localStorage.getItem('matema_music_track') ?? 'ghoul-projeto-novo')
    setMusicVolume(parseInt(localStorage.getItem('matema_music_volume') ?? '50', 10))
    setRain(localStorage.getItem('matema_rain_enabled') === 'true')
    setRainVolume(parseInt(localStorage.getItem('matema_rain_volume') ?? '50', 10))
    setSfx(localStorage.getItem('matema_sfx_enabled') !== 'false')
    setSfxVolume(parseInt(localStorage.getItem('matema_sfx_volume') ?? '50', 10))
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleMusic() {
    const next = !music
    setMusic(next)
    localStorage.setItem('matema_music_enabled', String(next))
    window.dispatchEvent(new CustomEvent('matema:music-toggle', { detail: { enabled: next } }))
  }

  function handleMusicTrack(track: string) {
    setMusicTrack(track)
    localStorage.setItem('matema_music_track', track)
    window.dispatchEvent(new CustomEvent('matema:music-track', { detail: { track } }))
  }

  function handleMusicVolume(v: number) {
    setMusicVolume(v)
    localStorage.setItem('matema_music_volume', String(v))
    window.dispatchEvent(new CustomEvent('matema:music-volume', { detail: { volume: v / 100 } }))
  }

  function toggleRain() {
    const next = !rain
    setRain(next)
    localStorage.setItem('matema_rain_enabled', String(next))
    window.dispatchEvent(new CustomEvent('matema:rain-toggle', { detail: { enabled: next } }))
  }

  function handleRainVolume(v: number) {
    setRainVolume(v)
    localStorage.setItem('matema_rain_volume', String(v))
    window.dispatchEvent(new CustomEvent('matema:rain-volume', { detail: { volume: v / 100 } }))
  }

  function toggleSfx() {
    const next = !sfx
    setSfx(next)
    localStorage.setItem('matema_sfx_enabled', String(next))
  }

  function handleSfxVolume(v: number) {
    setSfxVolume(v)
    localStorage.setItem('matema_sfx_volume', String(v))
  }

  const allOff = !music && !rain && !sfx

  function muteAll() {
    if (allOff) {
      // Religar: restaura música e SFX (padrão)
      setMusic(true)
      localStorage.setItem('matema_music_enabled', 'true')
      window.dispatchEvent(new CustomEvent('matema:music-toggle', { detail: { enabled: true } }))
      setSfx(true)
      localStorage.setItem('matema_sfx_enabled', 'true')
    } else {
      // Desligar tudo
      if (music) {
        setMusic(false)
        localStorage.setItem('matema_music_enabled', 'false')
        window.dispatchEvent(new CustomEvent('matema:music-toggle', { detail: { enabled: false } }))
      }
      if (rain) {
        setRain(false)
        localStorage.setItem('matema_rain_enabled', 'false')
        window.dispatchEvent(new CustomEvent('matema:rain-toggle', { detail: { enabled: false } }))
      }
      if (sfx) {
        setSfx(false)
        localStorage.setItem('matema_sfx_enabled', 'false')
      }
    }
  }

  function toggleTheme() {
    const next = !dark
    setDark(next)
    localStorage.setItem('matema_theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  function handleReset() {
    startTransition(async () => {
      await resetProgressAction()
      setConfirmReset(false)
      setResetDone(true)
      setTimeout(() => setResetDone(false), 3000)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAccountAction()
    })
  }

  function handleCancelSubscription() {
    setCancelError(null)
    startTransition(async () => {
      const res = await cancelProSubscriptionAction()
      if (res.error) { setCancelError(res.error); return }
      setConfirmCancel(false)
    })
  }

  const proUntilLabel = subscription?.proUntil
    ? new Date(subscription.proUntil).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-1">Configurações</h1>
        <p className="text-matema-muted text-sm">Personalize sua experiência no Matema.</p>
      </div>

      {/* Áudio */}
      <Section title="Áudio">
        {/* Botão mute geral */}
        <div className="flex items-center justify-between py-3 border-b border-matema-border">
          <p className="text-xs text-matema-muted">
            {allOff ? 'Som desligado' : 'Desligar tudo de uma vez'}
          </p>
          <button
            onClick={muteAll}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95',
              allOff
                ? 'bg-matema-secondary text-white shadow-md'
                : 'bg-red-500 text-white shadow-md hover:bg-red-600'
            )}
          >
            {allOff
              ? <><Volume2 className="w-3.5 h-3.5" strokeWidth={2} /> Ligar som</>
              : <><VolumeX className="w-3.5 h-3.5" strokeWidth={2} /> Audio off</>
            }
          </button>
        </div>
        <Toggle
          icon={<Music className="w-5 h-5 text-matema-primary" strokeWidth={1.75} />}
          label="Música ambiente"
          description="Trilha sonora animada enquanto você estuda"
          enabled={music}
          onToggle={toggleMusic}
        />
        {music && (
          <>
            {/* Seletor de trilha */}
            <div className="pb-3">
              <p className="text-xs font-semibold text-matema-muted mb-2">Trilha sonora</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'default', label: 'Padrão',           sub: 'Trilha sintética' },
                  { id: 'ghoul',   label: 'Ghoul Soundtrack', sub: 'Músicas originais feitas pelo adm (:' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleMusicTrack(t.id)}
                    className={cn(
                      'text-left px-3 py-2.5 rounded-2xl border-2 transition-all text-xs',
                      musicTrack === t.id
                        ? 'border-matema-primary bg-matema-primary/10'
                        : 'border-matema-border hover:border-matema-primary/40 hover:bg-matema-warm'
                    )}
                  >
                    <p className={cn('font-bold leading-tight', musicTrack === t.id ? 'text-matema-primary' : 'text-matema-dark')}>
                      {t.label}
                    </p>
                    <p className="text-matema-muted mt-0.5 leading-tight">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Volume */}
            <div className="pb-4 flex items-center gap-4">
              <span className="text-xs text-matema-muted w-20 flex-shrink-0">
                Volume: {musicVolume}%
              </span>
              <input
                type="range"
                min={1}
                max={100}
                value={musicVolume}
                onChange={(e) => handleMusicVolume(Number(e.target.value))}
                className="flex-1 accent-matema-primary h-1.5 rounded-full cursor-pointer"
              />
            </div>
          </>
        )}
        <Toggle
          icon={<CloudRain className="w-5 h-5 text-sky-500" strokeWidth={1.75} />}
          label="Som de chuva"
          description="Som relaxante de chuva para estudar"
          enabled={rain}
          onToggle={toggleRain}
        />
        {rain && (
          <div className="pb-4 flex items-center gap-4">
            <span className="text-xs text-matema-muted w-20 flex-shrink-0">
              Volume: {rainVolume}%
            </span>
            <input
              type="range"
              min={1}
              max={100}
              value={rainVolume}
              onChange={(e) => handleRainVolume(Number(e.target.value))}
              className="flex-1 accent-matema-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
        )}
        <Toggle
          icon={<Bell className="w-5 h-5 text-matema-primary" strokeWidth={1.75} />}
          label="Efeitos sonoros"
          description="Sons de clique, acerto e erro nas lições"
          enabled={sfx}
          onToggle={toggleSfx}
        />
        {sfx && (
          <div className="pb-4 flex items-center gap-4">
            <span className="text-xs text-matema-muted w-20 flex-shrink-0">
              Volume: {sfxVolume}%
            </span>
            <input
              type="range"
              min={1}
              max={100}
              value={sfxVolume}
              onChange={(e) => handleSfxVolume(Number(e.target.value))}
              className="flex-1 accent-matema-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
        )}
      </Section>

      {/* Tema */}
      <Section title="Aparência">
        <Toggle
          icon={dark
            ? <Moon className="w-5 h-5 text-indigo-500" strokeWidth={1.75} />
            : <Sun className="w-5 h-5 text-yellow-500" strokeWidth={1.75} />
          }
          label="Tema escuro"
          description={dark ? 'Modo escuro ativado' : 'Modo claro ativado'}
          enabled={dark}
          onToggle={toggleTheme}
        />
      </Section>

      {/* Assinatura */}
      {subscription && (
        <Section title="Assinatura">
          <div className="py-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
              </div>
              <div>
                {subscription.isAdmin ? (
                  <>
                    <p className="font-semibold text-matema-dark text-sm">Matema Pro (admin)</p>
                    <p className="text-xs text-matema-muted mt-0.5">Acesso Pro liberado sem mensalidade.</p>
                  </>
                ) : subscription.status === 'active' ? (
                  <>
                    <p className="font-semibold text-matema-dark text-sm">Matema Pro ativo</p>
                    <p className="text-xs text-matema-muted mt-0.5">
                      {subscription.hasActiveSubscription
                        ? `Assinatura no cartão${proUntilLabel ? ` · renova em ${proUntilLabel}` : ''}.`
                        : proUntilLabel ? `Acesso válido até ${proUntilLabel}.` : 'Acesso ativo.'}
                    </p>
                  </>
                ) : subscription.status === 'trial' ? (
                  <>
                    <p className="font-semibold text-matema-dark text-sm">Teste grátis ativo</p>
                    <p className="text-xs text-matema-muted mt-0.5">
                      {proUntilLabel ? `Grátis até ${proUntilLabel}.` : 'Período de teste em andamento.'}
                    </p>
                  </>
                ) : subscription.status === 'cancelled' ? (
                  <>
                    <p className="font-semibold text-matema-dark text-sm">Assinatura cancelada</p>
                    <p className="text-xs text-matema-muted mt-0.5">
                      {proUntilLabel ? `A renovação foi desligada — acesso até ${proUntilLabel}.` : 'Renovação desligada.'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-matema-dark text-sm">Você ainda não tem Pro</p>
                    <p className="text-xs text-matema-muted mt-0.5">Desbloqueie o Simulado ENEM completo.</p>
                  </>
                )}
              </div>
            </div>

            {!subscription.isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  <CreditCard className="w-4 h-4" strokeWidth={1.75} />
                  {subscription.status === 'none'
                    ? 'Conhecer o Pro'
                    : subscription.status === 'cancelled'
                      ? 'Reativar Pro'
                      : subscription.status === 'trial'
                        ? 'Assinar Pro'
                        : 'Ver planos'}
                </Link>

                {subscription.hasActiveSubscription && (
                  !confirmCancel ? (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-matema-warm border border-matema-border text-matema-dark hover:bg-matema-border transition-colors"
                    >
                      Cancelar assinatura
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-matema-dark">Cancelar a renovação?</span>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isPending}
                        className="px-4 py-1.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                      >
                        {isPending ? 'Cancelando…' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        disabled={isPending}
                        className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-matema-warm border border-matema-border text-matema-muted hover:bg-matema-border transition-colors"
                      >
                        Manter
                      </button>
                    </span>
                  )
                )}
              </div>
            )}

            {cancelError && <p className="mt-2 text-sm text-red-500">{cancelError}</p>}

            {subscription.hasActiveSubscription && (
              <p className="mt-2 text-[11px] text-matema-muted leading-relaxed">
                Ao cancelar, desligamos só a renovação automática — seu acesso Pro continua até o fim do período já pago.
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Conta */}
      <Section title="Conta">
        {/* Reset progresso */}
        <div className="py-4">
          <div className="flex items-start gap-3 mb-3">
            <RotateCcw className="w-5 h-5 text-matema-muted mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-matema-dark text-sm">Resetar progresso</p>
              <p className="text-xs text-matema-muted mt-0.5">
                Zera XP, moedas, nível e lições concluídas. Itens da loja são mantidos.
              </p>
            </div>
          </div>

          {resetDone && (
            <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
              Progresso resetado com sucesso!
            </p>
          )}

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-matema-warm border border-matema-border text-matema-dark hover:bg-matema-border transition-colors"
            >
              Resetar progresso
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-matema-dark mr-1">Tem certeza?</p>
              <button
                onClick={handleReset}
                disabled={isPending}
                className="px-4 py-1.5 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Resetando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                disabled={isPending}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-matema-warm border border-matema-border text-matema-muted hover:bg-matema-border transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Apagar conta */}
        <div className="py-4">
          <div className="flex items-start gap-3 mb-3">
            <Trash2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-red-600 text-sm">Apagar minha conta</p>
              <p className="text-xs text-matema-muted mt-0.5">
                Remove todos os seus dados permanentemente. Essa ação não pode ser desfeita.
              </p>
            </div>
          </div>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
            >
              Apagar conta
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
                <p className="text-sm font-bold text-red-700">Atenção: ação irreversível</p>
              </div>
              <p className="text-xs text-red-600 mb-3">
                Todos os seus dados (progresso, moedas, avatar, itens) serão apagados para sempre.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {isPending ? 'Apagando...' : 'Sim, apagar tudo'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
