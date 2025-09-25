const { asyncHandler } = require("../middlewares/errorHandler");
const chatRoom = require("../models/chatRoom");
const Message = require("../models/message");

exports.getRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalRooms = await chatRoom.countDocuments({ members: userId });

  const rooms = await chatRoom
    .find({ members: userId })
    .populate("members", "firstName lastName")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const counts = await Promise.all(
    rooms.map((room) =>
      Message.countDocuments({
        roomId: room._id,
        senderId: { $ne: userId },
        status: "sent",
      })
    )
  );

  const roomsWithUnread = rooms.map((room, idx) => ({
    ...room.toObject(),
    unreadCount: counts[idx],
  }));

  const totalUnread = await Message.countDocuments({
    roomId: { $in: rooms.map((r) => r._id) },
    senderId: { $ne: userId },
    status: "sent",
  });

  res.json({
    rooms: roomsWithUnread,
    pagination: {
      totalRooms,
      currentPage: page,
      totalPages: Math.ceil(totalRooms / limit),
      hasNextPage: page * limit < totalRooms,
      hasPrevPage: page > 1,
    },
    totalUnread,
  });
});
