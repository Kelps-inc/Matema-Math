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
      .select('item_id, is_equipped, shop_items(name, category, icon)')
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
        hairStyle:  row.hair_style  ?? 'curto',
        hairColor:  row.hair_color  ?? 'castanho',
        gender:     row.gender      ?? 'masculino',
      }
    : DEFAULT_AVATAR_CONFIG

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inventoryRows: any[] = inventoryResult.data ?? []

  const ownedItemNames: string[] = inventoryRows
    .map((r) => r.shop_items?.name ?? '')
    .filter(Boolean)

  const ownedVisualItems: { id: string; name: string; category: string; icon: string }[] =
    inventoryRows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.shop_items?.category === 'acessorio')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        id:       r.item_id as string,
        name:     r.shop_items?.name     ?? '',
        category: r.shop_items?.category ?? '',
        icon:     r.shop_items?.icon     ?? '✨',
      }))

  const equippedItemIds: string[] = inventoryRows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.is_equipped !== false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => r.item_id as string)

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-matema-dark mb-1">Meu Avatar</h1>
        <p className="text-sm text-matema-muted">Personalize seu personagem</p>
      </div>

      <AvatarEditor
        initialConfig={avatarConfig}
        ownedItemNames={ownedItemNames}
        ownedVisualItems={ownedVisualItems}
        initialEquippedIds={equippedItemIds}
      />
    </div>
  )
}
