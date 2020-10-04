import validator from "validator";

interface IValidationError {
  message: string;
}

interface IValidation {
  email?: string;
  password?: string;
}

export interface IError extends Error {
  data?: IValidationError[];
  code: number;
}

export const validateUserInput = (args: IValidation): void => {
  const errors = validate(args);
  if (errors.length > 0) {
    throw errorObj("Invalid Input.", errors, 422);
  }
};

export const validate = ({ email, password }: IValidation) => {
  const errors: IValidationError[] = [];
  if (email && !validator.isEmail(email)) {
    errors.push({ message: "E-mail is invalid" });
  }
  if (password) {
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: "Password is too short" });
    }
  }
  return errors;
};

const errorObj = (
  message: string,
  errors: IValidationError[],
  code: number
): IError => {
  const err = new Error(message) as IError;
  err.data = errors;
  err.code = code;
  return err;
};
