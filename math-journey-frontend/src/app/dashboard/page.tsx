import Link from 'next/link'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetModulesUseCase } from '@/application/use-cases/GetModulesUseCase'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { Avatar } from '@/presentation/components/avatar/Avatar'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const [profile, modules, inventoryResult] = await Promise.all([
    new SupabaseUserRepository(supabase).findById(user.id),
    new GetModulesUseCase(new SupabaseLearningRepository(supabase)).execute(user.id),
    (supabase as any)
      .from('user_inventory')
      .select('shop_items(name)')
      .eq('user_id', user.id),
  ])

  const ownedItemNames: string[] = (inventoryResult.data ?? []).map(
    (row: any) => row.shop_items?.name ?? ''
  ).filter(Boolean)

  if (!profile) redirect('/entrar')

  const totalLessons = modules.reduce((s, m) => s + m.totalCount, 0)
  const completedLessons = modules.reduce((s, m) => s + m.completedCount, 0)
  const nextModule = modules.find((m) => m.completedCount < m.totalCount)

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
          <Avatar ownedItemNames={ownedItemNames} size={130} />
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
          {ownedItemNames.length === 0 && (
            <Link href="/loja" className="text-xs text-matema-primary font-semibold mt-2 inline-block hover:underline">
              Visitar a loja para personalizar →
            </Link>
          )}
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

      {/* Continuar de onde parou */}
      {nextModule && (
        <div className="mb-8">
          <h2 className="font-bold text-matema-dark mb-3">Continuar de onde parou</h2>
          <Link
            href={`/modulos/${nextModule.slug}`}
            className="block bg-matema-primary text-white rounded-3xl p-5 hover:bg-matema-primary/90 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                {nextModule.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg leading-none mb-1">{nextModule.title}</p>
                <p className="text-white/80 text-sm">{nextModule.completedCount} de {nextModule.totalCount} lições</p>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </Link>
        </div>
      )}

      {/* Todos os módulos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-matema-dark">Todos os módulos</h2>
          <Link href="/modulos" className="text-sm text-matema-primary font-semibold hover:underline">
            Ver todos →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {modules.slice(0, 4).map((m) => (
            <Link
              key={m.id}
              href={`/modulos/${m.slug}`}
              className="bg-white rounded-2xl border border-matema-border p-4 flex items-center gap-3 hover:shadow-md hover:shadow-matema-dark/5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${m.color}20` }}
              >
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-matema-dark text-sm leading-none mb-1">{m.title}</p>
                <div className="flex items-center gap-2">
                  <ProgressBar value={m.completedCount} max={m.totalCount} size="sm" className="flex-1" />
                  <span className="text-xs text-matema-muted whitespace-nowrap">{m.progressPercent}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
