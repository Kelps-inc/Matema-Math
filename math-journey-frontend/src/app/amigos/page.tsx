import { redirect } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/server'
import { getMyFriendsAction } from '@/app/actions/duelo'
import { AmigosClient } from './AmigosClient'
import { Users } from 'lucide-react'

export default async function AmigosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { friends, pendingReceived } = await getMyFriendsAction()

  return (
    <div className="animate-fade-in">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-matema-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Users className="w-7 h-7 text-matema-secondary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-matema-dark leading-none">Amigos</h1>
          <p className="text-sm text-matema-muted">Busque jogadores e desafie-os para um Duelo</p>
        </div>
      </div>

      <AmigosClient
        initialFriends={friends}
        initialPending={pendingReceived}
      />

    </div>
  )
}
