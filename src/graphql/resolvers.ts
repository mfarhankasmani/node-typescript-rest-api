import User, { IUserDoc, IUser } from "../models/user";
import Post, { IPost, IPostDoc } from "../models/post";
import bcrypt from "bcryptjs";
import { validateUserInput, errorObj, validatePostInput } from "../validation";
import jwt from "jsonwebtoken";
import { CLIENT_SECRET } from "../app";

import {
  IUserInputArgs,
  ILoginInput,
  IPostInputData,
  IFindUser,
} from "./types";
import { Request } from "express";
import { ITokenReq } from "../middleware/auth";

const findUser = async ({
  existingUser = false,
  email,
  id,
}: IFindUser): Promise<IUserDoc | null> => {
  let user;

  if (email) {
    user = await User.findOne({ email });
  } else if (id) {
    user = await User.findById(id);
  } else {
    return null;
  }

  if (existingUser && user) {
    errorObj("User exists already", 404);
  }

  if (!existingUser && !user) {
    errorObj("Invalid User", 401);
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

const gqlPost = (post: IPostDoc) => {
  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
};

const resolver = {
  createUser: async (
    { userInput: { email, password, name } }: IUserInputArgs,
    req: Request
  ) => {
    validateUserInput({ email, password });
    await findUser({ existingUser: true, email });
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
    const user = await findUser({ email });
    if (user) {
      const isEqual = await bcrypt.compare(password, user.password);
      !isEqual && errorObj("Password is incorrect.", 401);
      const token = createToken(user);
      return { token, userId: user._id.toString() };
    }
  },

  creatPost: async (
    { postInput: { title, content, imageUrl } }: IPostInputData,
    req: ITokenReq
  ) => {
    !req.isAuth && errorObj("Not authenticated", 401);
    validatePostInput({ title, content });
    const user = await findUser({ id: req.userId });
    if (user) {
      const post = new Post({
        title,
        content,
        imageUrl,
        creator: user,
      } as IPost);
      const createdPost = await post.save();
      user.posts.push(createdPost);
      await user.save()
      return gqlPost(createdPost);
    }
  },
};

export default resolver;
