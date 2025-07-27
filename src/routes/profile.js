const express = require("express");
const {
  getLoggedInUserProfile,
  getOtherUserProfile,
  updateUserProfile,
} = require("../controllers/profileController");
const { authMiddleWare } = require("../middlewares/auth");

const profileRouter = express.Router();

profileRouter.get("/profile", authMiddleWare, getLoggedInUserProfile);
profileRouter.get("/profile/:id", authMiddleWare, getOtherUserProfile);
profileRouter.patch("/profile", authMiddleWare, updateUserProfile);

module.exports = profileRouter;
