import type { User } from '../entities/User'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  update(user: Partial<User> & { id: string }): Promise<void>
}
