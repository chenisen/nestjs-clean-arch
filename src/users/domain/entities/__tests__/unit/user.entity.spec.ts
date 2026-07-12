import { UserEntity, UserProps } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UserEntity unit tests', () => {
  let props: UserProps;
  let sut: UserEntity;

  beforeEach(() => {
    UserEntity.validate = jest.fn();
    props = UserDataBuilder({});
    sut = new UserEntity(props);
  });

  it('Contructor method', () => {
    expect(sut.props.name).toBe(props.name);
    expect(sut.props.email).toBe(props.email);
    expect(sut.props.password).toBe(props.password);
    expect(sut.props.createdAt).toBeInstanceOf(Date);
    expect(UserEntity.validate).toHaveBeenCalled();
  });

  it('Getter of name field', () => {
    expect(sut.name).toBeDefined();
    expect(sut.name).toBe(props.name);
    expect(typeof sut.name).toBe('string');
  });
  it('Setter of name field', () => {
    sut['name'] = 'other_name';
    expect(sut.name).toBe('other_name');
    expect(typeof sut.name).toBe('string');
  });

  it('Getter of email field', () => {
    expect(sut.email).toBeDefined();
    expect(sut.email).toBe(props.email);
    expect(typeof sut.email).toBe('string');
  });

  it('Getter of password field', () => {
    expect(sut.password).toBeDefined();
    expect(sut.password).toBe(props.password);
    expect(typeof sut.password).toBe('string');
  });
  it('Setter of name field', () => {
    sut['password'] = 'other_password';
    expect(sut.password).toBe('other_password');
    expect(typeof sut.password).toBe('string');
  });

  it('Getter of createdAt field', () => {
    expect(sut.createdAt).toBeDefined();
    expect(sut.createdAt).toBe(props.createdAt);
    expect(sut.createdAt).toBeInstanceOf(Date);
  });

  it('Should update a user name', () => {
    sut.update('other_name');
    expect(sut.name).toBe('other_name');
  });

  it('Should update a user password', () => {
    sut.updatePassword('other_password');
    expect(sut.password).toBe('other_password');
  });
});
