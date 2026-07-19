import { Entity } from '../entities/entity';
import {
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/searchable-repository-contracts';
import { UserEntity } from '../entities/user.entity';

export namespace UserRepository {
  export type UserFilter = string;

  export class UserSearchParams extends SearchParams<UserFilter> {}

  export class UserSearchResult extends SearchResult<UserEntity, UserFilter> {}

  export interface Repository extends SearchableRepositoryInterface<
    UserEntity,
    UserSearchParams,
    UserSearchResult
  > {
    findById(id: string): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity>;
    emailExists(email: string): Promise<void>;
  }
}
