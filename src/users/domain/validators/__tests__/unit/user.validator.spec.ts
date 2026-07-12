import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserRules, UserValidator } from '../../user.validator';
import { UserValidatorFactory } from '@/users/domain/validators/user.validator';

let sut: UserValidator;

describe('User validator unit tests', () => {
  beforeEach(() => {
    sut = UserValidatorFactory.create();
  });

  describe('Name field', () => {
    it('invalid cases for name field', () => {
      const isValid = sut.validate(null);
      expect(isValid).toBeFalsy();
      expect(sut.errors['name']).toStrictEqual([
        'name should not be empty',
        'name must be a string',
        'name must be shorter than or equal to 255 characters',
      ]);
    });

    it('valid cases for name field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate(props);
      expect(isValid).toBeTruthy();
      expect(sut.validatedData).toStrictEqual(new UserRules(props));
    });
  });

  describe('Email field', () => {
    it('invalid cases for email field', () => {
      const isValid = sut.validate(null);
      expect(isValid).toBeFalsy();
      expect(sut.errors['email']).toStrictEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'email must be shorter than or equal to 255 characters',
      ]);
    });

    it('valid cases for email field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate(props);
      expect(isValid).toBeTruthy();
      expect(sut.errors).toMatchObject({});
    });
  });

  describe('Password field', () => {
    it('invalid cases for password field', () => {
      const isValid = sut.validate(null);
      expect(isValid).toBeFalsy();
      expect(sut.errors['password']).toStrictEqual([
        'password should not be empty',
        'password must be a string',
        'password must be shorter than or equal to 100 characters',
      ]);
    });

    it('valid cases for password field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate(props);
      expect(isValid).toBeTruthy();
      expect(sut.validatedData).toStrictEqual(new UserRules(props));
    });
  });

  describe('createdAt field', () => {
    it('invalid cases for createdAt field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate({ ...props, createdAt: 'asdsadsa' });
      expect(isValid).toBeFalsy();
      expect(sut.errors['createdAt']).toStrictEqual([
        'createdAt must be a Date instance',
      ]);
    });

    it('valid cases for createdAt field', () => {
      const props = UserDataBuilder({});
      const isValid = sut.validate({ ...props, createdAt: new Date() });
      expect(isValid).toBeTruthy();
    });
  });
});
