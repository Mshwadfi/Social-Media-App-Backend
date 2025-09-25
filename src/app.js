const express = require("express");
const connectDB = require("./config/database");
const app = express();
const { createServer } = require("http");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("../utils/cronJob");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRequestRouter = require("./routes/connectionRequest");
const postRouter = require("./routes/post");
const feedRouter = require("./routes/feed");
const { globalErrorHandler } = require("./middlewares/errorHandler");
const {
  moderateLimiter,
  rateLimiterMiddleware,
} = require("./middlewares/rateLimiter");
const paymentRouter = require("./routes/payment");
const setupSocketIO = require("./config/socketIO");
const chatRouter = require("./routes/chat");
const { requestLogger } = require("./middlewares/loggerMiddleware");
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiterMiddleware(moderateLimiter));
app.use(requestLogger);
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", postRouter);
app.use("/", feedRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);
app.use(globalErrorHandler);

const server = createServer(app);
setupSocketIO(server);

connectDB()
  .then(() => {
    console.log("connected to db!");
    server.listen(4000, () => {
      console.log("server is running on port 4000");
    });
  })
  .catch((err) => {
    console.log("error connecting to db");
  });
