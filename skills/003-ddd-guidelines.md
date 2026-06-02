# Skill 003 — DDD Guidelines

## Os 4 layers e suas responsabilidades

### Domain (`src/domain/`)
- **O QUÊ**: Entidades, value objects, interfaces de repositório
- **PODE**: Lógica de negócio pura, métodos calculados, enums
- **NÃO PODE**: Importar Supabase, React, Next.js, ou qualquer lib externa
- **EXEMPLO**: `User.levelProgressPercent()`, `Exercise.isCorrect(answer)`

### Application (`src/application/`)
- **O QUÊ**: Use Cases — orquestram domínio + infraestrutura
- **PODE**: Instanciar repositórios, chamar métodos de domínio, retornar DTOs
- **NÃO PODE**: Tocar UI, renderizar React, chamar `revalidatePath`
- **EXEMPLO**: `CompleteLessonUseCase.execute(userId, lessonId, answers)`

### Infrastructure (`src/infrastructure/`)
- **O QUÊ**: Implementações concretas dos repositórios usando Supabase
- **PODE**: Queries Supabase, mapeamento DTO→Entidade
- **NÃO PODE**: Lógica de negócio, manipular UI
- **EXEMPLO**: `SupabaseLearningRepository.findAllModules()`

### Presentation (`src/presentation/`)
- **O QUÊ**: Componentes React puros
- **PODE**: Exibir dados, chamar Server Actions, gerenciar estado local de UI
- **NÃO PODE**: Acessar Supabase diretamente, lógica de negócio complexa
- **EXEMPLO**: `ExercisePlayer`, `Avatar`, `ShopGrid`

## Criando uma nova entidade de domínio

```typescript
// src/domain/learning/entities/MinhaEntidade.ts

export interface MinhaEntidade {
  id: string
  // campos obrigatórios com tipos precisos
  // use string, number, boolean — sem tipos Supabase
}

// Métodos puros como funções (não classe, a menos que necessário):
export function calcularAlgo(entidade: MinhaEntidade): number {
  return ...
}
```

## Criando um repositório

**Interface (domain):**
```typescript
// src/domain/learning/repositories/IMinhaEntidadeRepository.ts
export interface IMinhaEntidadeRepository {
  findAll(): Promise<MinhaEntidade[]>
  findById(id: string): Promise<MinhaEntidade | null>
  save(entidade: MinhaEntidade): Promise<void>
}
```

**Implementação (infrastructure):**
```typescript
// src/infrastructure/repositories/SupabaseMinhaEntidadeRepository.ts
export class SupabaseMinhaEntidadeRepository implements IMinhaEntidadeRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async findAll(): Promise<MinhaEntidade[]> {
    const { data, error } = await this.supabase.from('minha_tabela').select('*')
    if (error) throw new Error(error.message)
    return data.map(this.mapToEntity)
  }
  
  private mapToEntity(row: any): MinhaEntidade {
    return {
      id: row.id,
      // mapeie snake_case → camelCase aqui
    }
  }
}
```

## Criando um Use Case

```typescript
// src/application/use-cases/MeuUseCase.ts
export class MeuUseCase {
  constructor(
    private repo: IMinhaEntidadeRepository,
    private userRepo: IUserRepository  // se necessário
  ) {}
  
  async execute(userId: string, params: Params): Promise<Result> {
    // orquestre chamadas de repositório
    // aplique regras de negócio
    // retorne resultado tipado
  }
}
```

## Mapeamento snake_case ↔ camelCase

Banco de dados usa `snake_case`. TypeScript usa `camelCase`.
Faça a conversão **sempre no repositório** (infrastructure), nunca no domínio.

```typescript
// No repositório:
return {
  userId: row.user_id,
  displayName: row.display_name,
  eloTier: row.elo_tier,
  // ...
}
```

## Invariantes de domínio — onde aplicar

| Invariante | Onde |
|---|---|
| XP ≥ 0, moedas ≥ 0 | Constraint SQL + checagem no use case |
| Level ≥ 1 | Fórmula na entidade User |
| LP 0–99 | Server Action `saveRankedGameAction` |
| Placement: exatamente 15 questões | PlacementPlayer component |
| Resposta correta: comparação trimmed+lowercase | `Exercise.isCorrect()` |
