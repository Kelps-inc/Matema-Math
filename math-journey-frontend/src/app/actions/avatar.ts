'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'

export async function saveAvatarConfigAction(
  config: AvatarConfig,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('user_avatar_config').upsert(
    {
      user_id:    user.id,
      skin_tone:  config.skinTone,
      eye_color:  config.eyeColor,
      eye_style:  config.eyeStyle,
      nose_style: config.noseStyle,
      brow_style: config.browStyle,
      mouth_style: config.mouthStyle,
      body_type:  config.bodyType,
      height_type: config.heightType,
      hair_style:  config.hairStyle,
      hair_color:  config.hairColor,
      gender:      config.gender,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/loja')
  revalidatePath('/avatar')
  return { success: true }
}
