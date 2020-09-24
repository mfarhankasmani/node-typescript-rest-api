import { Router } from "express";
import { body } from "express-validator";

import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/feed";

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

router.put(
  `/post/:${POST_ID}`,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

router.delete(`/post/:${POST_ID}`, deletePost);
export default router;
