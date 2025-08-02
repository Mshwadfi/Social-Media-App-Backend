const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const { getFeed } = require("../controllers/feedController");
const feedRouter = express.Router();

feedRouter.get("/feed", authMiddleWare, getFeed);

module.exports = feedRouter;
