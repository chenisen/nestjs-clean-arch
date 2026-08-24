import { UserRepository } from '@/users/domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { UsersController } from '../../users.controller';
import { instanceToPlain } from 'class-transformer';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { createPrismaClient } from '@/shared/infrastructure/database/prisma/prisma-client.factory';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

type ResponseData = {
  data: void;
  error: string;
  message: string;
};

type LoginResponseData = {
  accessToken: string;
};

describe('UsersController e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  const prismaService = createPrismaClient();
  let hashProvider: HashProvider;
  let hashPassword: string;
  let accessToken: string;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile();
    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();
    repository = module.get<UserRepository.Repository>('UserRepository');
    hashProvider = new BcryptjsHashProvider();
    hashPassword = await hashProvider.generateHash('1234');
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    const authUser = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      }),
    );
    await repository.insert(authUser);
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' })
      .expect(200);
    const resBody = loginResponse.body as LoginResponseData;
    accessToken = resBody.accessToken;
    await repository.delete(authUser._id);
  });

  afterAll(async () => {
    await app.close();
    await prismaService.$disconnect();
  });

  describe('GET /users', () => {
    it('should return the users ordered by createdAt', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(3).fill(UserDataBuilder({}));
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...element,
            email: `a${index}@a.com`,
            createdAt: new Date(createdAt.getTime() + index),
          }),
        );
      });
      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON()),
      });
      const searchParams = {};
      const queryParams = new URLSearchParams(searchParams).toString();

      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      const dataExpected = await Promise.all(
        [...entities].reverse().map(async item => {
          const responseItem = await UsersController.userToResponse(item);
          return instanceToPlain(responseItem);
        }),
      );
      expect(res.body).toStrictEqual({
        data: dataExpected,
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 15,
          lastPage: 1,
        },
      });
    });

    it('should return the users ordered by createdAt', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...UserDataBuilder({}),
            name: element,
            email: `a${index}@a.com`,
          }),
        );
      });
      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON()),
      });
      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      };
      const queryParams = new URLSearchParams(searchParams as any).toString();

      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      const dataExpected = await Promise.all(
        [entities[0], entities[4]].map(async item => {
          const resItem = await UsersController.userToResponse(item);
          return instanceToPlain(resItem);
        }),
      );
      expect(res.body).toStrictEqual({
        data: dataExpected,
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      });
    });

    it('should return a error with 422 code when the query params is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/?fakeId=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422);
      const responseBody = res.body as ResponseData;
      expect(responseBody.error).toBe('Unprocessable Entity');
      expect(responseBody.message).toEqual([
        'property fakeId should not exist',
      ]);
    });
  });
});
