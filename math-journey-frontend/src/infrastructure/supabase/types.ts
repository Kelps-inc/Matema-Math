export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ExerciseType = 'multiple_choice' | 'true_false' | 'numeric'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_id: string
          level: number
          xp: number
          coins: number
          streak_days: number
          last_active_at: string
          created_at: string
          updated_at: string
          is_admin: boolean
          elo_tier: string
          elo_division: number
          placement_completed: boolean
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      modules: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          icon: string
          color: string
          order_index: number
          is_free: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          slug: string
          title: string
          description: string
          order_index: number
          xp_reward: number
          coin_reward: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      exercises: {
        Row: {
          id: string
          lesson_id: string
          question: string
          context: string | null
          type: ExerciseType
          options: Json | null
          correct_answer: string
          explanation: string
          difficulty: DifficultyLevel
          order_index: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['exercises']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed_at: string
          xp_earned: number
          coins_earned: number
          attempts: number
        }
        Insert: Omit<Database['public']['Tables']['user_lesson_progress']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['user_lesson_progress']['Insert']>
      }
      user_exercise_answers: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          answer: string
          is_correct: boolean
          answered_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_exercise_answers']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['user_exercise_answers']['Insert']>
      }
    }
    Functions: {
      award_lesson_completion: {
        Args: { p_user_id: string; p_lesson_id: string; p_xp: number; p_coins: number }
        Returns: { xp: number; level: number; coins: number }
      }
      xp_to_level: {
        Args: { xp_amount: number }
        Returns: number
      }
    }
  }
}
