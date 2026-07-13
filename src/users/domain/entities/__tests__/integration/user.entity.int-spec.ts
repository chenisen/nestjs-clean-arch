import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserEntity, UserProps } from '../../user.entity';
import { EntityValidationError } from '@/shared/domain/errors/validation-error';

describe('User entity integration tests', () => {
  describe('Constructor method', () => {
    it('Should throw and error when creating a invalid user name', () => {
      let props: UserProps = { ...UserDataBuilder({}), name: null };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), name: '' };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), name: 'a'.repeat(256) };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
    });

    it('Should throw and error when creating a invalid user email', () => {
      let props: UserProps = { ...UserDataBuilder({}), email: null };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), email: 'not-a-email.com.br' };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), email: 'a'.repeat(256) };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
    });

    it('Should throw and error when creating a invalid user password', () => {
      let props: UserProps = { ...UserDataBuilder({}), password: null };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), password: '' };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), password: 'a'.repeat(101) };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
    });

    it('Should throw and error when creating a invalid created password', () => {
      let props: UserProps = { ...UserDataBuilder({}), createdAt: null };
      expect(() => new UserEntity(props)).not.toThrow(EntityValidationError);
      props = { ...UserDataBuilder({}), createdAt: 'not-a-valid-date' };
      expect(() => new UserEntity(props)).toThrow(EntityValidationError);
    });

    it('Should be a valid user', () => {
      expect.assertions(0);
      const props: UserProps = UserDataBuilder({});
    });

    it('Should throw an error when trying to update user name', () => {
      const entity = new UserEntity(UserDataBuilder({}));
      expect(() => entity.update(null)).toThrow(EntityValidationError);
      expect(() => entity.update('')).toThrow(EntityValidationError);
      expect(() => entity.update('a'.repeat(256))).toThrow(
        EntityValidationError,
      );
    });

    it('Should not throw an error when trying to update user name', () => {
      expect.assertions(0);
      const entity = new UserEntity(UserDataBuilder({}));
      entity.update('other_name');
    });

    it('Should throw an error when trying to update user password', () => {
      const entity = new UserEntity(UserDataBuilder({}));
      expect(() => entity.updatePassword(null)).toThrow(EntityValidationError);
      expect(() => entity.updatePassword('')).toThrow(EntityValidationError);
      expect(() => entity.updatePassword('a'.repeat(256))).toThrow(
        EntityValidationError,
      );
    });

    it('Should not throw an error when trying to update user password', () => {
      expect.assertions(0);
      const entity = new UserEntity(UserDataBuilder({}));
      entity.updatePassword('new_password');
    });
  });
});
