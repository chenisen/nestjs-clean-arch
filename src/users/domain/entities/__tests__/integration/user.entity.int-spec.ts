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
  });
});
