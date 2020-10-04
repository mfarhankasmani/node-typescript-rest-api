// const resolver = {
//     // method name should match the query
//   hello() {
//     return {
//       text: "Hello World",
//       views: 12345,
//     };
//   },
// };

import User, { IUserDoc, IUser } from "../models/user";
import bcrypt from "bcryptjs";
import { validation } from "../validation";

interface userInputArgs {
  userInput: userInput;
}
interface userInput {
  email: string;
  name: string;
  password: string;
}

const resolver = {
  createUser: async (
    { userInput: { email, password, name } }: userInputArgs,
    req: Request
  ) => {
    const errors = validation({ email, password });

    if (errors.length > 0) {
      const error = new Error("Invalid Inputs.");
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User exists already");
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 12);
    const user: IUserDoc = new User({
      email,
      password: hashedPw,
      name,
    } as IUser);
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};

export default resolver;
