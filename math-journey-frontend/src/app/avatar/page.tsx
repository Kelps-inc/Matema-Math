import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { AvatarEditor } from '@/presentation/components/avatar/AvatarEditor'
import { DEFAULT_AVATAR_CONFIG } from '@/presentation/components/avatar/AvatarConfig'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'

export default async function AvatarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const [configResult, inventoryResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('user_avatar_config')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('user_inventory')
      .select('shop_items(name)')
      .eq('user_id', user.id),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = configResult.data as any
  const avatarConfig: AvatarConfig = row
    ? {
        skinTone:   row.skin_tone,
        eyeColor:   row.eye_color,
        eyeStyle:   row.eye_style,
        noseStyle:  row.nose_style,
        browStyle:  row.brow_style,
        mouthStyle: row.mouth_style,
        bodyType:   row.body_type,
        heightType: row.height_type,
      }
    : DEFAULT_AVATAR_CONFIG

  const ownedItemNames: string[] = (inventoryResult.data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => r.shop_items?.name ?? '')
    .filter(Boolean)

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-matema-dark mb-1">Meu Avatar</h1>
        <p className="text-sm text-matema-muted">Personalize seu personagem</p>
      </div>

      <AvatarEditor initialConfig={avatarConfig} ownedItemNames={ownedItemNames} />
    </div>
  )
}
