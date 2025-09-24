const Socket = require("socket.io");
const message = require("../models/message");
const chatRoom = require("../models/chatRoom");
const jwt = require("jsonwebtoken");

const setupSocketIO = (httpServer) => {
  const io = Socket(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // 🔹 Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // attach user payload to socket
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.user);

    // 🔹 Join chat room
    socket.on("joinchat", async ({ roomId }) => {
      const room = await chatRoom.findById(roomId);
      if (!room) {
        return socket.emit("error", { message: "Room not found" });
      }
      if (!room.members.includes(socket.user._id)) {
        return socket.emit("error", { message: "Unauthorized to join room" });
      }

      socket.join(roomId);
      console.log(`User: ${socket.user._id} joined room: ${roomId}`);
    });

    // 🔹 Send message
    socket.on("sendmessage", async ({ roomId, text, recieverId }) => {
      const senderId = socket.user._id;
      console.log(roomId, text);

      if (!text || !recieverId) {
        return socket.emit("error", { message: "Invalid data" });
      }
      let room;

      if (!roomId) {
        room = await chatRoom.findOne({
          members: { $all: [senderId, recieverId], $size: 2 },
        });

        if (!room) {
          room = await chatRoom.create({
            members: [senderId, recieverId],
          });
        }

        roomId = room._id.toString();

        socket.emit("roomcreated", { roomId });
      } else {
        room = await chatRoom.findById(roomId);
      }

      if (!room || !room.members.includes(senderId)) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      console.log(senderId, recieverId);
      // Save message
      const msg = await message.create({
        roomId,
        senderId,
        text,
      });

      const populatedMsg = await msg.populate("senderId", "firstName lastName");

      // Broadcast to room
      io.to(roomId).emit("receivemessage", populatedMsg);

      console.log(`💬 ${text} sent to room: ${roomId} by user: ${senderId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });
};

module.exports = setupSocketIO;
