import { validateSync } from 'class-validator';
import {
  FieldsErrors,
  ValidatorFieldsInterface,
} from './validator-fields.interface';

export abstract class ClassValidatorFields<
  PropsValidated extends object,
> implements ValidatorFieldsInterface<PropsValidated> {
  errors: FieldsErrors = {};
  validatedData: PropsValidated = {} as PropsValidated;

  validate(data: PropsValidated): boolean {
    const errors = validateSync(data);
    if (errors.length) {
      this.errors = {};
      for (const error of errors) {
        const field = error.property;
        this.errors[field] = Object.values(error.constraints);
      }
    } else {
      this.validatedData = data;
    }
    return !errors.length;
  }
}
