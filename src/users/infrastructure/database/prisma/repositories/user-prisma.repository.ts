import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { Prisma, PrismaClient } from '@prisma/client';
import { UserModelMapper } from '../models/user-model.mapper';

export class UserPrismaRepository implements UserRepository.Repository {
  sortableFields: string[] = ['name', 'createdAt'];

  constructor(private readonly prismaService: PrismaClient) {}

  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: entity.toJSON(),
    });
  }

  async findById(id: string): Promise<UserEntity> {
    return this._get(id);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError(`UserModel not found using email ${email}`);
    }

    return UserModelMapper.toEntity(user);
  }

  async emailExists(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      throw new ConflictError('Email address already used');
    }
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prismaService.user.findMany();
    return users.map(user => UserModelMapper.toEntity(user));
  }

  async update(entity: UserEntity): Promise<void> {
    await this._get(entity.id);

    const { id, ...data } = entity.toJSON();
    await this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this._get(id);
    await this.prismaService.user.delete({ where: { id } });
  }

  async search(
    props: UserRepository.UserSearchParams,
  ): Promise<UserRepository.UserSearchResult> {
    const where = this.applyFilter(props.filter);
    const orderBy = this.applySort(props.sort, props.sortDir);
    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        orderBy,
        skip: (props.page - 1) * props.perPage,
        take: props.perPage,
      }),
      this.prismaService.user.count({ where }),
    ]);

    return new UserRepository.UserSearchResult({
      items: users.map(user => UserModelMapper.toEntity(user)),
      total,
      currentPage: props.page,
      perPage: props.perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }

  protected applyFilter(
    filter: UserRepository.UserFilter | null,
  ): Prisma.UserWhereInput {
    return filter ? { name: { contains: filter, mode: 'insensitive' } } : {};
  }

  protected applySort(
    sort: string | null,
    sortDir: SortDirection | null,
  ): Prisma.UserOrderByWithRelationInput {
    const field =
      sort && this.sortableFields.includes(sort) ? sort : 'createdAt';
    return { [field]: sortDir ?? 'desc' };
  }

  protected async _get(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError(`UserModel not found using ID ${id}`);
    }

    return UserModelMapper.toEntity(user);
  }
}
