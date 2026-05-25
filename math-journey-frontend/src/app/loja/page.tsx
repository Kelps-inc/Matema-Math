import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { ShopGrid } from '@/presentation/components/shop/ShopGrid'
import { DEFAULT_AVATAR_CONFIG } from '@/presentation/components/avatar/AvatarConfig'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'

export default async function LojaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const [{ data: items }, { data: profile }, inventoryResult, avatarResult] = await Promise.all([
    (supabase as any).from('shop_items').select('*').eq('is_available', true).order('category').order('price'),
    (supabase as any).from('user_profiles').select('coins').eq('id', user.id).single(),
    (supabase as any).from('user_inventory').select('item_id, shop_items(name)').eq('user_id', user.id),
    (supabase as any).from('user_avatar_config').select('*').eq('user_id', user.id).single(),
  ])

  const coins = (profile as any)?.coins ?? 0
  const ownedItems: { id: string; name: string }[] = (inventoryResult.data ?? []).map((o: any) => ({
    id: o.item_id as string,
    name: o.shop_items?.name ?? '',
  }))

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
      }
    : DEFAULT_AVATAR_CONFIG

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-matema-dark mb-1">Loja</h1>
        <p className="text-sm text-matema-muted">Gaste suas moedas em itens exclusivos</p>
        <div className="inline-flex items-center gap-2 bg-matema-cream border border-matema-border rounded-2xl px-4 py-2 mt-3">
          <span>🪙</span>
          <span className="font-bold text-matema-dark">{coins} moedas disponíveis</span>
        </div>
      </div>

      <ShopGrid
        items={(items ?? []) as any[]}
        ownedItems={ownedItems}
        userCoins={coins}
        avatarConfig={avatarConfig}
      />
    </div>
  )
}
