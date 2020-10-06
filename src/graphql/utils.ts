import fs from "fs";
import path from "path";

import User, { IUserDoc } from "../models/user";
import { errorObj } from "../validation";
import { IFindUser } from "./types";
import jwt from "jsonwebtoken";
import { CLIENT_SECRET } from "../app";
import { IPostDoc } from "../models/post";

export const findUser = async ({
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

export const createToken = (user: IUserDoc): string => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    CLIENT_SECRET,
    { expiresIn: "1h" }
  );
};

export const gqlPost = (post: IPostDoc) => {
  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
  };
};

export const clearImage = (filePath: string) => {
  filePath = path.join(__dirname, "../../", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
