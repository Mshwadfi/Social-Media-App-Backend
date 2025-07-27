const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
} = require("../controllers/connectionRequestController");

const connectionRequestRouter = express.Router();

connectionRequestRouter.post("/request", authMiddleWare, sendRequest);
connectionRequestRouter.post(
  "/request/:id/accept",
  authMiddleWare,
  acceptRequest
);
connectionRequestRouter.post(
  "/request/:id/reject",
  authMiddleWare,
  rejectRequest
);

module.exports = connectionRequestRouter;
