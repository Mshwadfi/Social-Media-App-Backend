const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, age, gender } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).send("Missing required fields");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("Email Already Exists");

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

    res.status(201).send("User created successfully");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ error: "Invalid email or password" });

    const token = user.generateToken();
    res.cookie("token", token);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "User logged out successfully" });
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect" });

    if (newPassword !== confirmPassword)
      return res
        .status(400)
        .json({ error: "New password and confirmation do not match" });

    if (newPassword === currentPassword)
      return res.status(400).json({ error: "New password must be different" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

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
    console.error("Forgot Password Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const user = await User.findOne({ email });
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
    console.error("Reset Password Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
