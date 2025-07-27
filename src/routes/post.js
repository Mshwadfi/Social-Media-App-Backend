const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const {
  createPost,
  updatePost,
  getPostById,
  deletePost,
  toggleLikePost,
} = require("../controllers/postController");

const postRouter = express.Router();

postRouter.post("/post", authMiddleWare, createPost);
postRouter.patch("/post/:id", authMiddleWare, updatePost);
postRouter.get("/post/:id", getPostById);
postRouter.delete("/post/:id", authMiddleWare, deletePost);
postRouter.post("/post/:id/like", authMiddleWare, toggleLikePost);

module.exports = postRouter;
