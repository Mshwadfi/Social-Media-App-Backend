const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const Post = require("../models/post");

// Create Post
exports.createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const userId = req.user._id;
  if (!userId) return next(new AppError("Unauthorized", 401));

  let imageUrl = null;
  if (req.file && req.file.path) {
    imageUrl = req.file.path; // Cloudinary URL
  }
  const post = new Post({ userId, content, image: imageUrl });
  await post.save();
  res.status(201).json(post);
});

// Update Post
exports.updatePost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (String(post.userId) !== req.user._id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }
  let image = post.image;
  if (req.file && req.file.path) {
    image = req.file.path;
  }

  post.content = content || post.content;
  post.image = image || post.image;
  await post.save();
  res.status(200).json(post);
});

// Get Post by ID
exports.getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "userId",
    "username"
  );
  if (!post) return next(new AppError("Post not found", 404));

  res.status(200).json(post);
});

// Delete Post
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (String(post.userId) !== req.user._id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  await post.deleteOne();
  res.status(200).json({ message: "Post deleted successfully" });
});

// Like Post
exports.likePost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));
  if (post.likes.includes(userId)) {
    return next(new AppError("Post already liked", 400));
  }

  post.likes.push(userId);
  await post.save();
  res
    .status(200)
    .json({ message: "Post liked", likesCount: post.likes.length });
});

// Unlike Post
exports.unlikePost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  const idx = post.likes?.indexOf(userId);
  if (idx === -1) {
    return next(new AppError("Post not liked yet", 400));
  }

  post.likes.splice(idx, 1);
  await post.save();
  res
    .status(200)
    .json({ message: "Post unliked", likesCount: post.likes.length });
});
