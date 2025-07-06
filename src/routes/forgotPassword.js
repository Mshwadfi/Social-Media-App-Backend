const express = require("express");
const sendEmail = require("../../utils/sendEmail");
const User = require("../models/user");
const forgotPasswordRouter = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
forgotPasswordRouter.post("/forgot-password", async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = await bcrypt.hash(resetToken, 10);
    user.resetToken = hashedResetToken;
    user.resetTokenExpiration = Date.now() + 1000 * 60 * 10;
    const resetTokenUrl = `${process.env.FORGOT_PASSWORD_URL}token=${resetToken}&email=${email}`;
    await user.save();
    const emailData = {
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetTokenUrl}\n\nIf you did not request this, please ignore this email.`,
    };
    const mail = await sendEmail(emailData);
    if (!mail) {
      return res.status(500).json({
        success: false,
        error: "Failed to send reset password email",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Reset password email sent successfully",
    });
  } catch (error) {
    console.error("Error in forgot password route:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// reset-password end point

forgotPasswordRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (!user.resetToken || !user.resetTokenExpiration) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid reset token" });
    }
    const isTokenValid = await bcrypt.compare(token, user.resetToken);
    if (!isTokenValid || user.resetTokenExpiration < Date.now()) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired reset token" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in reset password route:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});
module.exports = forgotPasswordRouter;
