const mongoose = require("mongoose");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const Connection = require("../models/connection");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");

exports.sendRequest = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { receiverId } = req.body;

  if (!receiverId) throw new AppError("Receiver ID is required", 400);

  if (!mongoose.Types.ObjectId.isValid(receiverId))
    throw new AppError("Invalid receiver ID format", 400);

  if (user._id.equals(receiverId))
    throw new AppError("Cannot send connection request to yourself", 400);

  const receiverExists = await User.exists({ _id: receiverId });
  if (!receiverExists) throw new AppError("Receiver not found", 404);

  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      { senderId: user._id, receiverId },
      { senderId: receiverId, receiverId: user._id },
    ],
  });

  if (existingRequest) {
    throw new AppError(
      existingRequest.status === "pending"
        ? "Connection request already pending"
        : "You are already connected",
      400
    );
  }

  const request = await ConnectionRequest.create({
    senderId: user._id,
    receiverId,
    status: "pending",
    createdAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: "Request sent successfully",
    data: request,
  });
});

exports.acceptRequest = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user } = req;
    const { id: requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId))
      throw new AppError("Invalid request ID", 400);

    const request = await ConnectionRequest.findById(requestId).session(
      session
    );
    if (!request) throw new AppError("Request not found", 404);

    if (!request.receiverId.equals(user._id))
      throw new AppError("Unauthorized action", 403);

    const senderExists = await User.exists({ _id: request.senderId }).session(
      session
    );
    if (!senderExists) throw new AppError("Sender not found", 404);

    if (request.status !== "pending")
      throw new AppError("Request has already been processed", 400);

    const existingConnection = await Connection.findOne({
      $or: [
        { user1: request.senderId, user2: request.receiverId },
        { user1: request.receiverId, user2: request.senderId },
      ],
    }).session(session);

    if (existingConnection)
      throw new AppError("Users are already connected", 409);

    const updatedRequest = await ConnectionRequest.findOneAndUpdate(
      { _id: requestId, status: "pending" },
      { status: "accepted" },
      { new: true, session }
    );

    const connection = await Connection.create(
      [{ user1: request.senderId, user2: request.receiverId }],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      data: { request: updatedRequest, connection: connection[0] },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

exports.rejectRequest = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id: requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId))
    throw new AppError("Invalid request ID", 400);

  const request = await ConnectionRequest.findById(requestId);
  if (!request) throw new AppError("Request not found", 404);

  if (!request.receiverId.equals(user._id))
    throw new AppError("Unauthorized action", 403);

  const senderExists = await User.exists({ _id: request.senderId });
  if (!senderExists) throw new AppError("Sender not found", 404);

  if (request.status !== "pending")
    throw new AppError("Request has already been processed", 400);

  const existingConnection = await Connection.findOne({
    $or: [
      { user1: request.senderId, user2: request.receiverId },
      { user1: request.receiverId, user2: request.senderId },
    ],
  });

  if (existingConnection)
    throw new AppError("Users are already connected", 409);

  const updatedRequest = await ConnectionRequest.findOneAndUpdate(
    { _id: requestId, status: "pending" },
    { status: "rejected" },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: { request: updatedRequest },
  });
});
