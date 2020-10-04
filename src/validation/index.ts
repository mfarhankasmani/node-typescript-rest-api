import validator from "validator";

interface IValidationError {
  message: string;
}

interface IValidation {
  email?: string;
  password?: string;
}

export const validation = ({
  email,
  password,
}: IValidation): IValidationError[] => {
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
