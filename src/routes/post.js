const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const Post = require("../models/post");
const postRouter = express.Router();

// create post api
postRouter.post("/post", authMiddleWare, async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user._id;
    if (!userId) return res.status(401).send("unothurized");
    const post = new Post({ userId, content, image });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//update post api
postRouter.patch("/post/:id", authMiddleWare, async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (String(post.userId) !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    post.content = content || post.content;
    post.image = image || post.image;
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// git post by id
postRouter.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username"
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete post
postRouter.delete("/post/:id", authMiddleWare, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (String(post.userId) !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// like / unlike post
postRouter.put("/post/:id/like", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const index = post.likes?.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
      await post.save();
      return res
        .status(200)
        .json({ message: "Post liked", likesCount: post.likes.length });
    } else {
      post.likes.splice(index, 1);
      await post.save();
      return res
        .status(200)
        .json({ message: "Post unliked", likesCount: post.likes.length });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = postRouter;
