const { default: Redis } = require("ioredis");
const { AppError, asyncHandler } = require("../middlewares/errorHandler");
const User = require("../models/user");
const mongoose = require("mongoose");
const redis = require("../config/redis");

const allowedFields = ["firstName", "lastName", "age", "gender"];

exports.getLoggedInUserProfile = asyncHandler(async (req, res, next) => {
  // check redis first
  const cachKey = `user:${req.user._id}:profile`;
  const cachedProfile = await redis.get(cachKey);
  if (cachedProfile) {
    console.log("Serving from Redis cache");
    return res.json({ success: true, data: JSON.parse(cachedProfile) });
  }

  // if not in cache, fetch from DB
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));
  // cache the profile data in Redis for future requests
  await redis.set(cachKey, JSON.stringify(user), "EX", 3600);
  res.json({ success: true, data: user });
});

exports.getOtherUserProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError("Invalid user ID", 400));

  // check redis first
  const cachKey = `user:${id}:profile`;
  const cachedProfile = await redis.get(cachKey);
  if (cachedProfile) {
    console.log("Serving from Redis cache");
    return res.json({ success: true, data: JSON.parse(cachedProfile) });
  }

  // if not in cache, fetch from DB
  const user = await User.findById(id).select(allowedFields);
  if (!user) return next(new AppError("User not found", 404));
  await redis.set(cachKey, JSON.stringify(user), "EX", 3600);
  console.log("Serving from MongoDB");
  res.json({ success: true, data: user });
});

exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const updatedData = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  }).select(allowedFields);

  if (!updatedUser) return next(new AppError("User not found", 404));
  // Invalidate the cached profile in Redis
  const cachKey = `user:${req.user._id}:profile`;
  await redis.del(cachKey);
  res.json({
    success: true,
    user: updatedUser,
  });
});
