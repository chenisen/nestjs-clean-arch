import { HashProvider } from '@/shared/application/providers/hash-provider';
import { SignupUseCase } from '../../signup.usecase';
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

describe('SignupUseCase unit tests', () => {
  let sut: SignupUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new SignupUseCase.UseCase(repository, hashProvider);
  });

  it('Should create an user', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const props = UserDataBuilder({});
    const result = await sut.execute(props);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(spyInsert).toHaveBeenCalled();
  });

  it('Should not create an user with existing email', async () => {
    const email = 'a@a.com';
    const props = UserDataBuilder({ email });
    const firstUser = await sut.execute(props);
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('Should not create an user with any empty name', async () => {
    const props = UserDataBuilder({});
    const invalidProps = Object.assign(props, { name: null });
    await expect(() => sut.execute(invalidProps)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should not create an user with any empty email', async () => {
    const props = UserDataBuilder({});
    const invalidProps = Object.assign(props, { email: null });
    await expect(() => sut.execute(invalidProps)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should not create an user with any empty password', async () => {
    const props = UserDataBuilder({});
    const invalidProps = Object.assign(props, { password: null });
    await expect(() => sut.execute(invalidProps)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
