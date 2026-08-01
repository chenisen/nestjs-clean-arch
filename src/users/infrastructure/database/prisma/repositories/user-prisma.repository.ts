import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserRepository } from '@/users/domain/repositories/user.repository';

export class UserPrismaRepository implements UserRepository.Repository {
  sortableFields: string[] = ['name', 'createdAt'];

  constructor(prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity> {
    throw new Error(`Method not implemented`);
  }

  async emailExists(email: string): Promise<void> {
    throw new Error(`Method not implemented`);
  }

  protected applyFilter(
    items: UserEntity[],
    filter: UserRepository.UserFilter,
  ): Promise<UserEntity[]> {
    throw new Error(`Method not implemented`);
  }

  protected async applySort(
    items: UserEntity[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Promise<UserEntity[]> {
    throw new Error(`Method not implemented`);
  }
}
