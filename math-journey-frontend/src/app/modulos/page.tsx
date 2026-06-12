import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetModulesUseCase } from '@/application/use-cases/GetModulesUseCase'
import { ModuleCard } from '@/presentation/components/game/ModuleCard'
import { redirect } from 'next/navigation'

export default async function ModulosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modules, adminResult] = await Promise.all([
    new GetModulesUseCase(new SupabaseLearningRepository(supabase)).execute(user.id),
    (supabase as any).from('user_profiles').select('is_admin').eq('id', user.id).single(),
  ])
  const isAdmin: boolean = adminResult.data?.is_admin ?? false

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-2">Treinamento</h1>
        <p className="text-matema-muted">
          Treinamento para dar aquela aquecida
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}
