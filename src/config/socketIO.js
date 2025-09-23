const Socket = require("socket.io");

const setupSocketIO = (httpServer) => {
  const io = Socket(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("joinchat", (room) => {});
    socket.on("sendmessage", (data) => {});
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

module.exports = setupSocketIO;
