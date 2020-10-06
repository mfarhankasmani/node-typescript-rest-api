import User, { IUserDoc, IUser } from "../models/user";
import Post, { IPost, IPostDoc } from "../models/post";
import bcrypt from "bcryptjs";
import { validateUserInput, errorObj, validatePostInput } from "../validation";
import { IUserInputArgs, ILoginInput, IPostInputData, PostData } from "./types";
import { Request } from "express";
import { ITokenReq } from "../middleware/auth";
import * as utils from "./utils";

const resolver = {
  createUser: async (
    { userInput: { email, password, name } }: IUserInputArgs,
    req: Request
  ) => {
    validateUserInput({ email, password });
    await utils.findUser({ existingUser: true, email });
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
    const user = await utils.findUser({ email });
    if (user) {
      const isEqual = await bcrypt.compare(password, user.password);
      !isEqual && errorObj("Password is incorrect.", 401);
      const token = utils.createToken(user);
      return { token, userId: user._id.toString() };
    }
  },

  creatPost: async (
    { postInput: { title, content, imageUrl } }: IPostInputData,
    req: ITokenReq
  ) => {
    !req.isAuth && errorObj("Not authenticated", 401);
    validatePostInput({ title, content });
    const user = await utils.findUser({ id: req.userId });
    if (user) {
      const post = new Post({
        title,
        content,
        imageUrl,
        creator: user,
      } as IPost);
      const createdPost = await post.save();
      user.posts.push(createdPost);
      await user.save();
      return utils.gqlPost(createdPost);
    }
  },

  posts: async ({ page = 1 }, req: ITokenReq): Promise<PostData> => {
    !req.isAuth && errorObj("Not authenticated", 401);
    const totalPosts = await Post.find().countDocuments();

    const perPage = 2;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");

    return {
      posts: posts.map((p) => {
        return convertPost(p);
      }),
      totalPosts,
    };
  },

  post: async ({ id }: any, req: ITokenReq): Promise<IPost | undefined> => {
    !req.isAuth && errorObj("Not authenticated", 401);
    const post = await Post.findById(id).populate("creator");
    !post && errorObj("No post found!", 404);

    return post ? convertPost(post) : undefined;
  },
};

const convertPost = (post: IPostDoc): IPost => {
  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
  };
};

export default resolver;
