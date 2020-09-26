import fs from "fs";
import path from "path";

import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { IError } from "../app";

import Post, { IPost, IPostDoc } from "../models/post";
import User, { IUser, IUserDoc } from "../models/user";
import { IPostParams, POST_ID } from "../routes/feed";
import { ITokenReq } from "../middleware/is-auth";
import post from "../models/post";

interface IPostQuery {
  page?: number;
}

export const getPosts: RequestHandler = (req, res, next) => {
  const { page = 1 }: IPostQuery = req.query;
  const perPage = 2;
  let totalItems: number;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
    })
    .then((posts: IPost[]) => {
      res
        .status(200)
        .json({ message: "Fetched post successfully", posts, totalItems });
    })
    .catch((err: IError) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const createPost: RequestHandler = (req: ITokenReq, res, next) => {
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

  post
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user: IUserDoc | null) => {
      user?.posts.push(post);
      return user?.save();
    })
    .then((result) => {
      // Create post in database
      res.status(201).json({
        message: "Post created!",
        post,
        creator: { _id: result?._id.toString(), name: result?.name },
      });
    })
    .catch((err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      //for passing error to next error handling middleware
      next(err); // throwing err from async func will not reach to the next middleware
    });
};

export const getPost: RequestHandler = (req, res, next) => {
  const param: IPostParams = req.params;

  Post.findById(param[POST_ID])
    .then((post: IPost | null) => {
      if (!post) {
        const err = new Error("Could not find post.") as IError;
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({ message: "Post fetched", post });
    })
    .catch((err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

export const updatePost: RequestHandler = (req: ITokenReq, res, next) => {
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

  Post.findById(postId)
    .then((post: IPostDoc | null) => {
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
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((updatedPost) => {
      res.status(200).json({ message: "Post Updated!", post: updatedPost });
    })
    .catch((err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

export const deletePost: RequestHandler = (req: ITokenReq, res, next) => {
  const { postId }: IPostParams = req.params;
  Post.findById(postId)
    .then((post: IPostDoc | null) => {
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
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user: IUserDoc | null) => {
        // mongoose method for deleting value from the array
      user?.posts.pull(postId);
      return user?.save();
    })
    .then(() => {
      res.status(200).json({ message: "Post Deleted" });
    })
    .catch((err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath: string) => {
  filePath = path.join(__dirname, "../../", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
