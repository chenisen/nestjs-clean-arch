import { UserRepository } from '@/users/domain/repositories/user.repository';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { UserOutput } from '../dtos/user-output';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

export namespace UpdatePasswordUseCase {
  export type Input = {
    id: string;
    password: string;
    oldPassword: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.password || !input.oldPassword) {
        throw new InvalidPasswordError(
          'Old password and new password is required',
        );
      }
      const entity = await this.userRepository.findById(input.id);
      const validOldPassword = await this.hashProvider.compareHash(
        input.oldPassword,
        entity.password,
      );
      if (!validOldPassword) {
        throw new InvalidPasswordError('Invalid old password');
      }
      const hashPassword = await this.hashProvider.generateHash(input.password);
      //atualizou a entidade
      entity.updatePassword(hashPassword);
      await this.userRepository.update(entity);
      return entity.toJSON();
    }
  }
}
