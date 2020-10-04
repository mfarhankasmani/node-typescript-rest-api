import { title } from "process";
import validator from "validator";

interface IValidationError {
  message: string;
}

interface IValidation {
  email?: string;
  password?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
}

export interface IError extends Error {
  data?: IValidationError[];
  code: number;
}

export const validateUserInput = (args: IValidation): void => {
  const errors = validate(args);
  if (errors.length > 0) {
    errorObj("Invalid Input.", 422, errors);
  }
};

export const validatePostInput = (args: IValidation): void => {
  const errors = validate(args);
  if (errors.length > 0) {
    errorObj("Invalid Post.", 422, errors);
  }
};

export const validate = ({ email, password, title, content }: IValidation) => {
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
  if (title) {
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title is invalid" });
    }
  }
  if (content) {
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid" });
    }
  }
  return errors;
};

export const errorObj = (
  message: string,
  code: number,
  errors?: IValidationError[]
): IError => {
  const err = new Error(message) as IError;
  err.data = errors;
  err.code = code;
  throw err;
};
