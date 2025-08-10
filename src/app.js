const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("../utils/cronJob");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRequestRouter = require("./routes/connectionRequest");
const postRouter = require("./routes/post");
const feedRouter = require("./routes/feed");
const { globalErrorHandler } = require("./middlewares/errorHandler");
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", postRouter);
app.use("/", feedRouter);
app.use(globalErrorHandler);
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
