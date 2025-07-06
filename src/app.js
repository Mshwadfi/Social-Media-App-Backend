const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRequestRouter = require("./routes/connectionRequest");
const forgotPasswordRouter = require("./routes/forgotPassword");
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", forgotPasswordRouter);
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
