import Link from 'next/link'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetModulesUseCase } from '@/application/use-cases/GetModulesUseCase'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { Avatar } from '@/presentation/components/avatar/Avatar'
import { DEFAULT_AVATAR_CONFIG } from '@/presentation/components/avatar/AvatarConfig'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'
import { redirect } from 'next/navigation'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import {
  Zap,
  Coins,
  Medal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Star,
  CheckCircle,
  XCircle,
  SkipForward,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const learningRepo = new SupabaseLearningRepository(supabase)
  const [profile, modules, inventoryResult, avatarResult, rankedStats, tutorialProgressResult] = await Promise.all([
    new SupabaseUserRepository(supabase).findById(user.id),
    new GetModulesUseCase(learningRepo).execute(user.id),
    (supabase as any)
      .from('user_inventory')
      .select('is_equipped, shop_items(name, category)')
      .eq('user_id', user.id),
    (supabase as any)
      .from('user_avatar_config')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    learningRepo.findRankedLessonStats(user.id),
    (supabase as any)
      .from('user_lesson_progress')
      .select('completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const ownedItemNames: string[] = (inventoryResult.data ?? [])
    .filter((row: any) => row.is_equipped !== false && row.shop_items?.category === 'acessorio')
    .map((row: any) => row.shop_items?.name ?? '')
    .filter(Boolean)

  const avatarRow = avatarResult.data as any
  const avatarConfig: AvatarConfig = avatarRow
    ? {
        skinTone:   avatarRow.skin_tone,
        eyeColor:   avatarRow.eye_color,
        eyeStyle:   avatarRow.eye_style,
        noseStyle:  avatarRow.nose_style,
        browStyle:  avatarRow.brow_style,
        mouthStyle: avatarRow.mouth_style,
        bodyType:   avatarRow.body_type,
        heightType: avatarRow.height_type,
        hairStyle:  avatarRow.hair_style  ?? 'curto',
        hairColor:  avatarRow.hair_color  ?? 'castanho',
        gender:     avatarRow.gender      ?? 'masculino',
      }
    : DEFAULT_AVATAR_CONFIG

  if (!profile) redirect('/entrar')

  function fmtDate(d: Date | string | null | undefined): string {
    if (!d) return ''
    const dt = typeof d === 'string' ? new Date(d) : d
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const tutorialCompletedAt: Date | null = tutorialProgressResult.data?.completed_at
    ? new Date(tutorialProgressResult.data.completed_at)
    : null

  const rankedAccuracy = rankedStats.total > 0
    ? Math.round((rankedStats.correct / rankedStats.total) * 100)
    : null

  const totalLessons = modules.reduce((s, m) => s + m.totalCount, 0)
  const completedLessons = modules.reduce((s, m) => s + m.completedCount, 0)
  return (
    <div className="animate-fade-in">
      {/* Saudação */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-1">
          Olá, {profile.displayName.split(' ')[0]}!
        </h1>
        <p className="text-matema-muted">
          {completedLessons === 0 && rankedStats.total === 0
            ? 'Pronto para começar sua jornada matemática?'
            : `Você já respondeu a ${completedLessons + rankedStats.total} questões. Continue assim!`}
        </p>
      </div>

      {/* Avatar + stats */}
      <div className="bg-white rounded-3xl border border-matema-border p-6 mb-6 flex items-center gap-6">
        <div className="flex-shrink-0">
          <Avatar config={avatarConfig} ownedItemNames={ownedItemNames} size={130} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-matema-muted mb-1 font-medium">Seu personagem</p>
          <p className="font-bold text-matema-dark text-lg mb-3">{profile.displayName}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-matema-cream rounded-xl px-3 py-1.5">
              <Zap className="w-4 h-4 text-yellow-500" strokeWidth={1.75} />
              <span className="text-sm font-bold text-matema-dark">{profile.xp} XP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-matema-cream rounded-xl px-3 py-1.5">
              <Coins className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
              <span className="text-sm font-bold text-matema-dark">{profile.coins}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-matema-cream rounded-xl px-3 py-1.5">
              <Medal className="w-4 h-4 text-matema-primary" strokeWidth={1.75} />
              <span className="text-sm font-bold text-matema-dark">Nível {profile.level}</span>
            </div>
          </div>
          {ownedItemNames.length > 0 && (
            <p className="text-xs text-matema-muted mt-2">{ownedItemNames.length} {ownedItemNames.length !== 1 ? 'itens' : 'item'} na mochila</p>
          )}
          <Link href="/avatar" className="text-xs text-matema-primary font-semibold mt-2 inline-block hover:underline">
            Editar avatar →
          </Link>
        </div>
      </div>

      {/* Elo + Placement */}
      {profile.placementCompleted && (
        <div className="bg-white rounded-3xl border border-matema-border p-6 mb-6 flex items-center gap-5">
          <div className="flex-shrink-0">
            <EloTierIcon tier={profile.eloTier as EloTier} size="w-12 h-12" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-matema-muted uppercase tracking-wide font-medium mb-0.5">Elo Ranqueada</p>
            <p className="text-xl font-extrabold text-matema-dark leading-none">
              {ELO_TIER_LABELS[profile.eloTier as EloTier]}
              {profile.eloTier !== 'mestre' && (
                <span className="text-matema-muted font-semibold ml-1">
                  {['', 'I', 'II', 'III', 'IV'][profile.eloDivision] ?? profile.eloDivision}
                </span>
              )}
            </p>
            {profile.eloTier !== 'mestre' ? (
              <div className="mt-2 max-w-[160px]">
                <div className="text-xs text-matema-muted mb-1">
                  <span className="font-semibold">{profile.eloLp} PDL</span>
                </div>
                <div className="h-1.5 bg-matema-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matema-primary rounded-full"
                    style={{ width: `${profile.eloLp}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-matema-muted mt-1">{profile.eloLp} PDL</p>
            )}
          </div>
          <Link
            href="/dashboard/placement"
            className="shrink-0 text-xs font-semibold text-matema-primary bg-matema-primary/10 hover:bg-matema-primary/20 transition-colors px-4 py-2.5 rounded-2xl text-center leading-tight"
          >
            Teste de nivelamento<br />resultado →
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {/* Card de progresso - Tutorial */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-matema-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-extrabold text-matema-dark text-lg">Seu progresso</h2>
              <p className="text-sm text-matema-muted">
                {completedLessons === totalLessons && totalLessons === 16
                  ? <>16/16 · Tutorial Completo{tutorialCompletedAt && <span className="text-matema-muted"> em {fmtDate(tutorialCompletedAt)}</span>} <CheckCircle2 className="inline w-4 h-4 text-green-500" strokeWidth={1.75} /></>
                  : `Tutorial: ${completedLessons} de ${totalLessons} lições concluídas`}
              </p>
              {profile.placementCompleted && (
                <p className="text-sm text-matema-muted mt-0.5">
                  Teste de nivelamento completo{profile.placementCompletedAt && <span> em {fmtDate(profile.placementCompletedAt)}</span>} <CheckCircle2 className="inline w-4 h-4 text-green-500" strokeWidth={1.75} />
                </p>
              )}
            </div>
            <div className="w-14 h-14 bg-matema-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-extrabold text-matema-primary">{profile.level}</span>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs text-matema-muted mb-1.5">
              <span>Nível {profile.level}</span>
              <span>Nível {profile.level + 1}</span>
            </div>
            <ProgressBar value={profile.levelProgressPercent()} max={100} color="primary" />
            <p className="text-xs text-matema-muted mt-1 text-right">
              {profile.xpToNextLevel()} XP para o próximo nível
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          <div className="bg-white rounded-2xl border border-matema-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-matema-primary/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-500" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">{profile.xp.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-matema-muted">XP total</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-matema-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-matema-gold/15 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">{profile.coins}</p>
              <p className="text-xs text-matema-muted">Moedas</p>
            </div>
          </div>

          {profile.streakDays > 0 && (
            <div className="bg-white rounded-2xl border border-matema-border p-4 flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-matema-dark leading-none">{profile.streakDays}</p>
                <p className="text-xs text-matema-muted">Dias seguidos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lições Ranqueadas */}
      <div className="bg-white rounded-3xl border border-matema-border p-6">
        <h2 className="font-bold text-matema-dark text-lg mb-4">Lições Ranqueadas</h2>

        {/* Difficulty breakdown */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-matema-muted">Fáceis</p>
                <p className="text-xl font-extrabold text-matema-dark">{rankedStats.easy}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-matema-muted">Médias</p>
                <p className="text-xl font-extrabold text-matema-dark">{rankedStats.medium}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-matema-muted">Difíceis</p>
                <p className="text-xl font-extrabold text-matema-dark">{rankedStats.hard}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-matema-muted mb-1">Total</p>
            <p className="text-2xl font-extrabold text-matema-primary">{rankedStats.total}</p>
          </div>
        </div>

        {/* Correct / wrong / accuracy */}
        <div className="border-t border-matema-border pt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={1.75} />
            <div>
              <p className="text-xs text-matema-muted">Acertos</p>
              <p className="text-base font-extrabold text-matema-dark">{rankedStats.correct}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" strokeWidth={1.75} />
            <div>
              <p className="text-xs text-matema-muted">Erros</p>
              <p className="text-base font-extrabold text-matema-dark">{rankedStats.wrong}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkipForward className="w-5 h-5 text-amber-400" strokeWidth={1.75} />
            <div>
              <p className="text-xs text-matema-muted">Puladas</p>
              <p className="text-base font-extrabold text-matema-dark">{rankedStats.skipped}</p>
            </div>
          </div>
          {rankedAccuracy !== null && (
            <div className="ml-auto text-right">
              <p className="text-xs text-matema-muted">Precisão</p>
              <p className="text-xl font-extrabold text-matema-primary">{rankedAccuracy}%</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
