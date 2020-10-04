import User, { IUserDoc, IUser } from "../models/user";
import bcrypt from "bcryptjs";
import { IError, validateUserInput, errorObj } from "../validation";
import jwt from "jsonwebtoken";
import { CLIENT_SECRET } from "../app";

interface IUserInputArgs {
  userInput: IUserInput;
}
interface IUserInput extends ILoginInput {
  name: string;
}

interface ILoginInput {
  email: string;
  password: string;
}

const findUserByEmail = async (
  email: string,
  existingUser: boolean = false
): Promise<IUserDoc | null> => {
  const user = await User.findOne({ email });

  if (existingUser && user) {
    errorObj("User exists already", 404);
  }

  if (!existingUser && !user) {
    errorObj("User does not exist", 401);
  }

  return user;
};

const createToken = (user: IUserDoc): string => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    CLIENT_SECRET,
    { expiresIn: "1h" }
  );
};

const resolver = {
  createUser: async (
    { userInput: { email, password, name } }: IUserInputArgs,
    req: Request
  ) => {
    validateUserInput({ email, password });
    await findUserByEmail(email, true);
    const hashedPw = await bcrypt.hash(password, 12);
    const user: IUserDoc = new User({
      email,
      password: hashedPw,
      name,
    } as IUser);
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async ({ email, password }: ILoginInput) => {
    const user = await findUserByEmail(email);
    if (user) {
      const isEqual = await bcrypt.compare(password, user.password);
      !isEqual && errorObj("Password is incorrect.", 401);
      const token = createToken(user);
      return { token, userId: user._id.toString() };
    }
  },
};

export default resolver;
