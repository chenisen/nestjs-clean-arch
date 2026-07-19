import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { BcryptjsHashProvider } from '../../bcryptjs-hash.provider';

describe('BcryptjsHashProvider unit tests', () => {
  let sut: BcryptjsHashProvider;

  beforeEach(() => {
    sut = new BcryptjsHashProvider();
  });

  it('Should return an encrypt password', async () => {
    const password = 'teste@123';
    const hash = await sut.generateHash(password);
    expect(hash).toBeDefined();
  });

  it('Should be a invalid password', async () => {
    const password = 'teste@123';
    const fakePassword = 'teste@1234';
    const hash = await sut.generateHash(password);
    const validPassword = await sut.compareHash(fakePassword, hash);
    expect(validPassword).toBeFalsy();
  });

  it('Should be a valid password', async () => {
    const password = 'teste@123';
    const hash = await sut.generateHash(password);
    const validPassword = await sut.compareHash(password, hash);
    expect(validPassword).toBeTruthy();
  });
});
