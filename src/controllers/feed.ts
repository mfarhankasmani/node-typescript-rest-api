import { RequestHandler } from "express";

export interface PostBody {
  title: string;
  content: string;
}

export const getPosts: RequestHandler = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: "First Post", content: "This is the first post!" }],
  });
};

export const createPost: RequestHandler = (req, res, next) => {
  const { title, content } = req.body as PostBody;
  // Create post in database
  res.status(201).json({
    message: "Post created!",
    id: new Date().toISOString(),
    title,
    content,
  });
};
