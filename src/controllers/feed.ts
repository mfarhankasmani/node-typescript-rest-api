import { RequestHandler } from "express";
import { validationResult } from "express-validator";
export interface PostBody {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  creator: {
    name: string;
  };
  createdAt: Date;
}

export const getPosts: RequestHandler = (req, res, next) => {
  const posts: PostBody[] = [
    {
      _id: "1",
      title: "First Post",
      content: "This is the first post!!",
      imageUrl: "images/book.jpg",
      creator: {
        name: "farhan",
      },
      createdAt: new Date(),
    },
  ];

  res.status(200).json({
    posts,
  });
};

export const createPost: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation is failed, entered correct data",
      errors: errors.array(),
    });
  }
  const { title, content } = req.body as PostBody;
  // Create post in database
  res.status(201).json({
    message: "Post created!",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: "farhan" },
      createdAt: new Date(),
    },
  });
};
