import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { createPrismaClient } from '@/shared/infrastructure/database/prisma/prisma-client.factory';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserPrismaRepository } from '../../user-prisma.repository';

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
});
