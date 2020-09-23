import { RequestHandler, RequestParamHandler } from "express";
import { validationResult } from "express-validator";
import { IError } from "../app";

import Post, { IPost } from "../models/post";
import { IPostParams, POST_ID } from "../routes/feed";

export const getPosts: RequestHandler = (req, res, next) => {
  console.log("inside getPosts");

  Post.find()
    .then((posts: IPost[]) => {
      res.status(200).json({ message: "Fetched post successfully", posts });
    })
    .catch((err: IError) => {
      console.log("inside getPosts error");

      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

export const createPost: RequestHandler = (req, res, next) => {
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
    creator: {
      name: "Farhan",
    },
  } as IPost);

  post
    .save()
    .then((result) => {
      // Create post in database
      res.status(201).json({
        message: "Post created!",
        post: result,
      });
    })
    .catch((err: IError) => {
      console.log(err);
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
      console.log("inside getPost error");

      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};
