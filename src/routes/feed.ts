import { Router } from "express";
import { body } from "express-validator";

import { createPost, getPosts } from "../controllers/feed";

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

export default router;
