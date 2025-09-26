const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { AppError } = require("./errorHandler");
require("dotenv").config();

const authMiddleWare = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return next(new AppError("Unauthorized: No token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;
    const user = await User.findById(_id);

    if (!user) return next(new AppError("Unauthorized: Invalid token", 401));
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }

    next(error);
  }
};

module.exports = { authMiddleWare };
