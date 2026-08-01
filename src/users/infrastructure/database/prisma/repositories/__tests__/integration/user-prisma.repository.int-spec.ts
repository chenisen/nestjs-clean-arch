import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { createPrismaClient } from '@/shared/infrastructure/database/prisma/prisma-client.factory';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserPrismaRepository } from '../../user-prisma.repository';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('UserPrismaRepository integration tests', () => {
  const prismaService = createPrismaClient();
  let sut: UserPrismaRepository;
  let module: TestingModule;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    sut = new UserPrismaRepository(prismaService);
    await prismaService.user.deleteMany();
  });

  it('should throws error when entity not found', async () => {
    const id = 'd4255494-f981-4d26-a2a1-35d3f5b8d36b';
    await expect(sut.findById(id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${id}`),
    );
  });

  it('should finds a entity by id', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });

    const output = await sut.findById(newUser.id);
    expect(output.toJSON()).toStrictEqual(entity.toJSON());
  });

  it('should insert a new entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await sut.insert(entity);
    const result = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });
    expect(result).toStrictEqual(entity.toJSON());
  });

  it('should find all user entities', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });
    const allUsers = await sut.findAll();
    expect(entity).toHaveLength(1);
    return allUsers.map(outputUser => {
      expect(outputUser.toJSON()).toStrictEqual(entity.toJSON());
    });
  });

  it('should throws error on update when a entity not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    );
  });

  it('should update a entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });
    entity.update('new name');
    await sut.update(entity);

    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });
    expect(output.name).toBe('new name');
  });

  it('should throws error on delete when a entity not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await expect(() => sut.delete(entity._id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    );
  });

  it('should delete a entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });
    await sut.delete(entity._id);

    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });
    expect(output).toBeNull();
  });

  it('should throws error when a entity not found', async () => {
    await expect(() => sut.findByEmail('a@a.com')).rejects.toThrow(
      new NotFoundError(`UserModel not found using email a@a.com`),
    );
  });

  it('should finds a entity by email', async () => {
    const entity = new UserEntity(UserDataBuilder({ email: 'a@a.com' }));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });
    const output = await sut.findByEmail('a@a.com');

    expect(output.toJSON()).toStrictEqual(entity.toJSON());
  });

  it('should throws error when a entity found by email', async () => {
    const entity = new UserEntity(UserDataBuilder({ email: 'a@a.com' }));
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    });

    await expect(() => sut.emailExists('a@a.com')).rejects.toThrow(
      new ConflictError(`Email address already used`),
    );
  });

  it('should not finds a entity by email', async () => {
    expect.assertions(0);
    await sut.emailExists('a@a.com');
  });

  describe('search method tests', () => {
    it('should apply only pagination when the other params are null', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(16).fill(UserDataBuilder({}));
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...element,
            name: `User${index}`,
            email: `test${index}@mail.com`,
            createdAt: new Date(createdAt.getTime() + index),
          }),
        );
      });

      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON()),
      });

      const searchOutput = await sut.search(
        new UserRepository.UserSearchParams(),
      );
      const items = searchOutput.items;
      expect(searchOutput).toBeInstanceOf(UserRepository.UserSearchResult);
      expect(searchOutput.total).toBe(16);
      searchOutput.items.forEach(item => {
        expect(item).toBeInstanceOf(UserEntity);
      });
      items.reverse().forEach((item, index) => {
        expect(`test${index + 1}@mail.com`).toBe(item.email);
      });
    });
  });
});
