const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const { getRooms } = require("../controllers/chatController");

const chatRouter = express.Router();

chatRouter.get("/rooms", authMiddleWare, getRooms);

module.exports = chatRouter;
