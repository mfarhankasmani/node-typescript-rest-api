import { Router } from "express";
import { body } from "express-validator";

import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/feed";

import isAuth from "../middleware/is-auth";

export const POST_ID = "postId";
export interface IPostParams {
  [POST_ID]?: string;
}

const router = Router();

router.get("/posts", isAuth, getPosts);

router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

//for singlePost
router.get(`/post/:${POST_ID}`, isAuth, getPost);

router.put(
  `/post/:${POST_ID}`,
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

router.delete(`/post/:${POST_ID}`, isAuth, deletePost);
export default router;
