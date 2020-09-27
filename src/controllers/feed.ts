import fs from "fs";
import path from "path";

import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { IError } from "../app";

import Post, { IPost } from "../models/post";
import User from "../models/user";
import { ITokenReq } from "../middleware/is-auth";

interface IPostQuery {
  page?: number;
}

export const POST_ID = "postId";
export interface IPostParams {
  [POST_ID]?: string;
}

export const getPosts: RequestHandler = async (req, res, next) => {
  const { page = 1 }: IPostQuery = req.query;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    res
      .status(200)
      .json({ message: "Fetched post successfully", posts, totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const createPost: RequestHandler = async (req: ITokenReq, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation is failed, entered correct data"
    ) as IError;
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image found") as IError;
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body as IPost;
  const imageUrl = req.file.path.replace("\\", "/");

  const post = new Post({
    title: title,
    content,
    imageUrl,
    creator: req.userId,
  } as IPost);

  try {
    await post.save();
    const user = await User.findById(req.userId);
    user?.posts.push(post);
    await user?.save();

    // Create post in database
    res.status(201).json({
      message: "Post created!",
      post,
      creator: { _id: user?._id.toString(), name: user?.name },
    });
  } catch {
    (err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      //for passing error to next error handling middleware
      next(err); // throwing err from async func will not reach to the next middleware
    };
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  const param: IPostParams = req.params;

  try {
    const post = await Post.findById(param[POST_ID]);
    if (!post) {
      const err = new Error("Could not find post.") as IError;
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ message: "Post fetched", post });
  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
    }
    next(err);
  }
};

export const updatePost: RequestHandler = async (req: ITokenReq, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation is failed, entered correct data"
    ) as IError;
    error.statusCode = 422;
    throw error;
  }

  const { postId }: IPostParams = req.params;
  const { title, content }: IPost = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked.") as IError;
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const err = new Error("Could not find post.") as IError;
      err.statusCode = 404;
      throw err;
    }
    if (post.creator._id.toString() !== req.userId) {
      const err = new Error("User is not authorized") as IError;
      err.statusCode = 403;
      throw err;
    }
    if (imageUrl !== post?.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    await post.save();

    res.status(200).json({ message: "Post Updated!", post });
  } catch {
    (err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    };
  }
};

export const deletePost: RequestHandler = async (req: ITokenReq, res, next) => {
  const { postId }: IPostParams = req.params;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const err = new Error("Could not find post.") as IError;
      err.statusCode = 404;
      throw err;
    }
    if (post.creator.toString() !== req.userId) {
      const err = new Error("User is not authorized") as IError;
      err.statusCode = 403;
      throw err;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);

    // mongoose method for deleting value from the array
    user?.posts.pull(postId);
    await user?.save();

    res.status(200).json({ message: "Post Deleted" });
  } catch {
    (err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    };
  }
};

const clearImage = (filePath: string) => {
  filePath = path.join(__dirname, "../../", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
