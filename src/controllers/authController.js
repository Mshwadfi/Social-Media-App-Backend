const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");

// Register
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName, age, gender } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return next(new AppError("Missing required fields", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError("Email already exists", 400));

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    age,
    gender,
  });
  await newUser.save();

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { id: newUser._id, email: newUser.email },
  });
});

// Login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 400));
  }

  const token = user.generateToken();
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
});

// Change Password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = req.user;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return next(new AppError("Current password is incorrect", 400));

  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirmation do not match", 400)
    );
  }

  if (newPassword === currentPassword) {
    return next(new AppError("New password must be different", 400));
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = await bcrypt.hash(resetToken, 10);

  user.resetToken = hashedResetToken;
  user.resetTokenExpiration = Date.now() + 1000 * 60 * 10; // 10 minutes
  await user.save();

  const resetTokenUrl = `${process.env.FORGOT_PASSWORD_URL}token=${resetToken}&email=${email}`;

  const emailData = {
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetTokenUrl}\n\nIf you did not request this, please ignore this email.`,
  };

  const mail = await sendEmail(emailData);
  if (!mail)
    return next(new AppError("Failed to send reset password email", 500));

  res.status(200).json({
    success: true,
    message: "Reset password email sent successfully",
  });
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  if (!user.resetToken || !user.resetTokenExpiration) {
    return next(new AppError("Invalid reset token", 400));
  }

  const isTokenValid = await bcrypt.compare(token, user.resetToken);
  if (!isTokenValid || user.resetTokenExpiration < Date.now()) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
