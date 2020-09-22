import { Router } from "express";
import { body } from "express-validator";

import { createPost, getPosts, getPost } from "../controllers/feed";

export const POST_ID = "postId";
export interface IPostParams {
  [POST_ID]?: string;
}

const router = Router();

router.get("/posts", getPosts);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

//for singlePost
router.get(`/post/:${POST_ID}`, getPost);
export default router;
