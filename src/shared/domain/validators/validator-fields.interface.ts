export type FieldsErrors = {
  [field: string]: string[];
};

export interface ValidatorFieldsInterface<PropsValidated extends object> {
  errors: FieldsErrors;
  validatedData: PropsValidated;
  validate(data: PropsValidated): boolean;
}
