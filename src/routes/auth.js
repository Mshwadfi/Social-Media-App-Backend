const express = require("express");
const {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { authMiddleWare } = require("../middlewares/auth");
const {
  rateLimiterMiddleware,
  strictLimiter,
} = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/register", rateLimiterMiddleware(strictLimiter), register);
router.post("/login", rateLimiterMiddleware(strictLimiter), login);
router.post("/logout", logout);
router.post(
  "/change-password",
  rateLimiterMiddleware(strictLimiter),
  authMiddleWare,
  changePassword
);
router.post(
  "/forgot-password",
  rateLimiterMiddleware(strictLimiter),
  forgotPassword
);
router.post(
  "/reset-password",
  rateLimiterMiddleware(strictLimiter),
  resetPassword
);

module.exports = router;
