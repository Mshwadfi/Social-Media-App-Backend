const express = require("express");
const User = require("../models/user");
const { authMiddleWare } = require("../middlewares/auth");

const profileRouter = express.Router();

//get profile api
profileRouter.get("/profile", authMiddleWare, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    res.send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: false, error: "internal server error" });
  }
});

module.exports = profileRouter;
