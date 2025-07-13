const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const { Connection } = require("mongoose");
const feedRouter = express.Router();

//get feed

feedRouter.get("/feed", authMiddleWare, async (req, res) => {
  const user = req.user;
  if (!user) res.status(401).send("un uthorized");

  const connections = await Connection.find({
    $or: [{ user1: user._id }, { user2: user._id }],
  });
  const userConnections = connections?.map((c) =>
    c.user1 === user._id ? user2 : user1
  );
});
