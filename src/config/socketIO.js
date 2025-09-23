const Socket = require("socket.io");

const setupSocketIO = (httpServer) => {
  const io = Socket(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    socket.on("joinchat", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`user: ${userId} has joined room: ${roomId}`);
    });
    socket.on("sendmessage", ({ roomId, senderId, text }) => {
      //1: save message to db with time stamps

      //2: send the message to everyone n the room
      io.to(roomId).emit("receivemessage", { roomId, senderId, text });
      console.log(
        `message: ${text} sent to room: ${roomId} from user: ${senderId}`
      );
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

module.exports = setupSocketIO;
