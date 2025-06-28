const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const Connection = require("../models/connection");
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

//accept connection request
connectionRequestRouter.post(
  "/request/:id/accept",
  authMiddleWare,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user } = req;
      const { id: requestId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, error: "Invalid request ID" });
      }

      const request = await ConnectionRequest.findById(requestId).session(
        session
      );
      if (!request) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ success: false, error: "Request not found" });
      }

      if (!request.receiverId.equals(user._id)) {
        await session.abortTransaction();
        return res
          .status(403)
          .json({ success: false, error: "Unauthorized action" });
      }

      const senderExists = await User.exists({ _id: request.senderId }).session(
        session
      );
      if (!senderExists) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ success: false, error: "Sender not found" });
      }

      if (request.status !== "pending") {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: "Request has already been processed",
        });
      }

      // Check if connection already exists
      const existingConnection = await Connection.findOne({
        $or: [
          { user1: request.senderId, user2: request.receiverId },
          { user1: request.receiverId, user2: request.senderId },
        ],
      }).session(session);

      if (existingConnection) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          error: "Users are already connected",
        });
      }

      const updatedRequest = await ConnectionRequest.findOneAndUpdate(
        { _id: requestId, status: "pending" },
        { status: "accepted" },
        { new: true, session }
      );

      const connection = new Connection({
        user1: request.senderId,
        user2: request.receiverId,
      });
      await connection.save({ session });

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: "Request accepted successfully",
        data: {
          request: updatedRequest,
          connection,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Accept Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    } finally {
      session.endSession();
    }
  }
);

module.exports = connectionRequestRouter;
