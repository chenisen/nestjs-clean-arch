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
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';
import { createPrismaClient } from '@/shared/infrastructure/database/prisma/prisma-client.factory';
import { UpdatePasswordDto } from '../../dto/update-password.dto';

type ResponseData = {
  data: object;
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
  let updatePasswordDto: UpdatePasswordDto;
  const prismaService = createPrismaClient();
  let entity: UserEntity;
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
    updatePasswordDto = {
      password: 'new_password',
      oldPassword: 'old_password',
    };
    await prismaService.user.deleteMany();
    const hashPassword = await hashProvider.generateHash('old_password');
    entity = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      }),
    );
    await repository.insert(entity);
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: 'old_password' })
      .expect(200);
    const resBody = loginResponse.body as LoginResponseData;
    accessToken = resBody.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await prismaService.$disconnect();
  });
  it('should update a password', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${entity._id}/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatePasswordDto)
      .expect(200);
    expect(Object.keys(res.body)).toStrictEqual(['data']);
    const resBody = res.body as ResponseData;
    const user = await repository.findById(resBody.data.id);
    const checkNewPassword = await hashProvider.compareHash(
      'new_password',
      user.password,
    );
    expect(checkNewPassword).toBeTruthy();
  });

  it('should return a error with 422 code when the request body is invalid', async () => {
    const fakeId = crypto.randomUUID();
    const res = await request(app.getHttpServer())
      .patch(`/users/${fakeId}/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(422);
    const resBody = res.body as ResponseData;
    expect(resBody.error).toBe('Unprocessable Entity');
    expect(resBody.message).toEqual([
      'password should not be empty',
      'password must be a string',
      'oldPassword should not be empty',
      'oldPassword must be a string',
    ]);
  });

  it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
    const fakeId = crypto.randomUUID();
    const res = await request(app.getHttpServer())
      .patch(`/users/${fakeId}/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatePasswordDto)
      .expect(404);
    const resBody = res.body as ResponseData;
    expect(resBody.error).toBe('Not Found');
    expect(resBody.message).toEqual(`UserModel not found using ID ${fakeId}`);
  });

  it('should return a error with 422 code when the oldPassword field is invalid', async () => {
    delete updatePasswordDto.oldPassword;
    const res = await request(app.getHttpServer())
      .patch(`/users/${entity._id}/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatePasswordDto)
      .expect(422);
    const resBody = res.body as ResponseData;
    expect(resBody.error).toBe('Unprocessable Entity');
    expect(resBody.message).toEqual([
      'oldPassword should not be empty',
      'oldPassword must be a string',
    ]);
  });

  it('should return a error with 422 code when password does not match', async () => {
    updatePasswordDto.oldPassword = 'fake';
    const res = await request(app.getHttpServer())
      .patch(`/users/${entity._id}/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatePasswordDto)
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: 'Invalid old password',
      });
  });
});
