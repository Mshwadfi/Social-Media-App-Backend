const { AppError, asyncHandler } = require("../middlewares/errorHandler");
const User = require("../models/user");
const mongoose = require("mongoose");

const allowedFields = ["firstName", "lastName", "age", "gender"];

exports.getLoggedInUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));
  res.json({ success: true, data: user });
});

exports.getOtherUserProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError("Invalid user ID", 400));

  const user = await User.findById(id).select(allowedFields);
  if (!user) return next(new AppError("User not found", 404));

  res.json({ success: true, data: user });
});

exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const updatedData = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  }).select(allowedFields);

  if (!updatedUser) return next(new AppError("User not found", 404));

  res.json({
    success: true,
    user: updatedUser,
  });
});
