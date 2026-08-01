import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { createPrismaClient } from '@/shared/infrastructure/database/prisma/prisma-client.factory';
import { PrismaClient, User } from '@prisma/client';
import { UserModelMapper } from '../../user-model.mapper';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { ValidationError } from '@/shared/domain/errors/validation-error';

describe('UserModelMapper integration tests', () => {
  let prismaService: PrismaClient;
  let props: User;

  beforeAll(async () => {
    setupPrismaTests();
    prismaService = createPrismaClient();
    await prismaService.$connect();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    props = {
      id: 'd4255494-f981-4d26-a2a1-35d3f5b8d36a',
      name: 'Test name',
      email: 'a@a.com',
      password: 'TestPassword123',
      createdAt: new Date(),
    };
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('should throws error when user model is invalid', async () => {
    const model: User = { ...props, name: null };
    expect(() => UserModelMapper.toEntity(model)).toThrow(ValidationError);
  });

  it('should convert a user model to a user entity', async () => {
    const model: User = await prismaService.user.create({
      data: props,
    });
    const sut = UserModelMapper.toEntity(model);
    expect(sut).toBeInstanceOf(UserEntity);
    expect(sut.toJSON()).toStrictEqual(props);
  });
});
