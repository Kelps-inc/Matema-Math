import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetModulesUseCase } from '@/application/use-cases/GetModulesUseCase'
import { ModuleCard } from '@/presentation/components/game/ModuleCard'
import { redirect } from 'next/navigation'

export default async function ModulosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const useCase = new GetModulesUseCase(new SupabaseLearningRepository(supabase))
  const modules = await useCase.execute(user.id)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-2">Módulos</h1>
        <p className="text-matema-muted">
          Escolha um módulo e comece a aprender. Complete as lições para desbloquear novos conteúdos.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  )
}
