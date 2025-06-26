const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const connectionRequestRouter = express.Router();

connectionRequestRouter.post("/request", authMiddleWare, async (req, res) => {
  try {
    const { user } = req;
    const { receiverId } = req.body;

    // Validate input
    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, error: "Receiver ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid receiver ID format" });
    }

    // Prevent narcissist users from sending connections to themselves
    if (user._id.equals(receiverId)) {
      return res.status(400).json({
        success: false,
        error: "Cannot send connection request to yourself",
      });
    }

    // Check if receiver exists
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res
        .status(404)
        .json({ success: false, error: "Receiver not found" });
    }

    // Check for existing requests between these 2 users
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { senderId: user._id, receiverId },
        { senderId: receiverId, receiverId: user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error:
          existingRequest.status === "pending"
            ? "Connection request already pending"
            : "You are already connected",
      });
    }

    // Create new request
    const request = new ConnectionRequest({
      senderId: user._id,
      receiverId,
      status: "pending",
      createdAt: new Date(),
    });

    await request.save();

    return res.status(201).json({
      success: true,
      message: "Request sent successfully",
      data: request,
    });
  } catch (error) {
    console.error("Request Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = connectionRequestRouter;
