const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { authMiddleWare } = require("../middlewares/auth");
//register api
authRouter.post("/register", async (req, res) => {
  const userData = req.body;
  console.log("user data: ", userData);
  const existingUser = await User.findOne({ email: userData.email });
  console.log(userData, existingUser);
  if (existingUser) return res.status(400).send("Email Already Exist");
  console.log("cont");
  try {
    const { email, password, firstName, lastName, age, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const registeredUser = new User({
      email,
      firstName,
      lastName,
      age,
      gender,
      password: hashedPassword,
    });
    await registeredUser.save();
    res.send("User Created Successfully");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// login api
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log({ email, password });
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = user.generateToken();
    res.cookie("token", token);
    res.status(200).send({
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
});

//log Out
authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// reset Password
authRouter.post("/resetpassword", authMiddleWare, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New password and confirmation do not match",
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = authRouter;
