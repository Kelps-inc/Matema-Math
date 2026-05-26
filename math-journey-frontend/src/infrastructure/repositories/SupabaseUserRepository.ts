import type { SupabaseClient } from '@supabase/supabase-js'
import type { IUserRepository } from '@/domain/user/repositories/IUserRepository'
import { User } from '@/domain/user/entities/User'

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    const d = data as any

    return new User(
      d.id,
      '',
      d.username,
      d.display_name,
      d.avatar_id,
      d.level,
      d.xp,
      d.coins,
      d.streak_days,
      new Date(d.last_active_at),
      new Date(d.created_at),
      d.is_admin ?? false,
      d.elo_tier ?? 'bronze',
      d.elo_division ?? 4,
      d.placement_completed ?? false,
    )
  }

  async update(user: Partial<User> & { id: string }): Promise<void> {
    await this.supabase
      .from('user_profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }
}
