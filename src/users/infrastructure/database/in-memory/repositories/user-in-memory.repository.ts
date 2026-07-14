import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository';
import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserRepository } from '@/users/domain/repositories/user.repository';

export class UserInMemoryRepository
  extends InMemorySearchableRepository<UserEntity>
  implements UserRepository.Repository
{
  sortableFields: string[] = ['name', 'createdAt'];
  async findByEmail(email: string): Promise<UserEntity> {
    const user = this.items.find(item => item.email === email);
    if (!user) {
      throw new NotFoundError(`User not found using email ${email}`);
    }
    return user;
  }

  async emailExists(email: string): Promise<void> {
    const user = this.items.find(item => item.email === email);
    if (user) {
      throw new ConflictError(`Email address already used`);
    }
  }

  protected applyFilter(
    items: UserEntity[],
    filter: UserRepository.UserFilter,
  ): Promise<UserEntity[]> {
    if (!filter) {
      return items;
    }
    return items.filter(item => {
      return item.props.name
        .toLocaleLowerCase()
        .includes(filter.toLocaleLowerCase());
    });
  }

  protected async applySort(
    items: UserEntity[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Promise<UserEntity[]> {
    return !sort
      ? super.applySort(items, 'createdAt', 'desc')
      : super.applySort(items, sort, sortDir);
  }
}
