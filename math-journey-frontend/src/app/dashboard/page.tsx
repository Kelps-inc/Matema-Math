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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const [profile, modules, inventoryResult, avatarResult] = await Promise.all([
    new SupabaseUserRepository(supabase).findById(user.id),
    new GetModulesUseCase(new SupabaseLearningRepository(supabase)).execute(user.id),
    (supabase as any)
      .from('user_inventory')
      .select('is_equipped, shop_items(name)')
      .eq('user_id', user.id),
    (supabase as any)
      .from('user_avatar_config')
      .select('*')
      .eq('user_id', user.id)
      .single(),
  ])

  const ownedItemNames: string[] = (inventoryResult.data ?? [])
    .filter((row: any) => row.is_equipped !== false)
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

  const totalLessons = modules.reduce((s, m) => s + m.totalCount, 0)
  const completedLessons = modules.reduce((s, m) => s + m.completedCount, 0)
  return (
    <div className="animate-fade-in">
      {/* Saudação */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-1">
          Olá, {profile.displayName.split(' ')[0]}! 👋
        </h1>
        <p className="text-matema-muted">
          {completedLessons === 0
            ? 'Pronto para começar sua jornada matemática?'
            : `Você já completou ${completedLessons} li${completedLessons !== 1 ? 'ções' : 'ção'}. Continue assim!`}
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
              <span>⚡</span>
              <span className="text-sm font-bold text-matema-dark">{profile.xp} XP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-matema-cream rounded-xl px-3 py-1.5">
              <span>🪙</span>
              <span className="text-sm font-bold text-matema-dark">{profile.coins}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-matema-cream rounded-xl px-3 py-1.5">
              <span>🏅</span>
              <span className="text-sm font-bold text-matema-dark">Nível {profile.level}</span>
            </div>
          </div>
          {ownedItemNames.length > 0 && (
            <p className="text-xs text-matema-muted mt-2">{ownedItemNames.length} item{ownedItemNames.length !== 1 ? 'ns' : ''} na mochila</p>
          )}
          <Link href="/avatar" className="text-xs text-matema-primary font-semibold mt-2 inline-block hover:underline">
            Editar avatar →
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {/* Card de progresso */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-matema-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-matema-dark text-lg">Seu progresso</h2>
              <p className="text-sm text-matema-muted">{completedLessons} de {totalLessons} lições concluídas</p>
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
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">{profile.xp.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-matema-muted">XP total</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-matema-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-matema-gold/15 rounded-xl flex items-center justify-center">
              <span className="text-xl">🪙</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">{profile.coins}</p>
              <p className="text-xs text-matema-muted">Moedas</p>
            </div>
          </div>

          {profile.streakDays > 0 && (
            <div className="bg-white rounded-2xl border border-matema-border p-4 flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-matema-dark leading-none">{profile.streakDays}</p>
                <p className="text-xs text-matema-muted">Dias seguidos</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
