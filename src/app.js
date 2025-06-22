const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { hash } = require("bcrypt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authMiddleWare } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
// sign up user
app.post("/signUp", async (req, res) => {
  console.log(req.body);
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) return res.status(400).send("email Already Exist");
  try {
    const { firstName, lastName, age, gender, email, password } = req.body;
    const encryptedPassword = await hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      age,
      gender,
      email,
      password: encryptedPassword,
    });
    await user.save();
    res.send("user created successfully!");
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
// login

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = user.generateToken();
    res.cookie("token", token);
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({ message: "Login successful", user: userObject });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get user profile
app.get("/profile", authMiddleWare, async (req, res) => {
  try {
    const { user } = req;
    if (!user) res.status(401).send("user not found");
    res.send({ user });
  } catch (error) {
    res.status(500).send(error);
  }
});
connectDB()
  .then(() => {
    console.log("connected to db!");
    app.listen(4000, () => {
      console.log("server is running on port 4000");
    });
  })
  .catch((err) => {
    console.log("error connecting to db");
  });
