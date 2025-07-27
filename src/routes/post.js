const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const {
  createPost,
  updatePost,
  getPostById,
  deletePost,
  toggleLikePost,
  likePost,
  unlikePost,
} = require("../controllers/postController");

const postRouter = express.Router();

postRouter.post("/post", authMiddleWare, createPost);
postRouter.patch("/post/:id", authMiddleWare, updatePost);
postRouter.get("/post/:id", getPostById);
postRouter.delete("/post/:id", authMiddleWare, deletePost);
postRouter.post("/post/:id/like", authMiddleWare, likePost);
postRouter.delete("/post/:id/unlike", authMiddleWare, unlikePost);

module.exports = postRouter;
