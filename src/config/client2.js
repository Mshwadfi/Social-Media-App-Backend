const { io } = require("socket.io-client");
const readline = require("readline");

// Setup readline for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = io("http://localhost:4000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vaGFtZWRhbHNod2FkZnkyNEBnbWFpbC5jb20iLCJfaWQiOiI2ODU0NjcyZDFiMjBiNDUwNTUyZTQwNzciLCJpYXQiOjE3NTg3MzgyNjgsImV4cCI6MTc1OTM0MzA2OH0.ZnY9X9R5Eh3ve1pqOKO1N8k4r9PvWzsKR3UR10_OXTk",
  },
});

// creat simple roomid: we need to change this later with some thing robust maybe uuid
let roomId = "68d40e1ce0abd6659508feb6";

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Join room
  socket.emit("joinchat", { roomId });
  //   console.log(`🟢 Joined room: ${roomId}`);

  socket.on("roomcreated", ({ roomId: newRoomId }) => {
    roomId = newRoomId;
    socket.emit("joinchat", { roomId: newRoomId });
    console.log(`🟢 Joined room: ${newRoomId}`);
  });

  socket.on("unreadmessages", (messages) => {
    console.log("📥 You have unread messages:");
    messages.forEach((msg) => {
      console.log(`\n📩 ${msg.senderId.firstName}: ${msg.text}`);
    });
    rl.prompt();
  });

  // Prompt user for input
  rl.setPrompt("💬 Enter message: ");
  rl.prompt();

  rl.on("line", (line) => {
    const message = {
      roomId,
      text: line.trim(),
      recieverId: "68580835788465174387e4d9",
    };

    socket.emit("sendmessage", message);
    rl.prompt();
  });
});

socket.on("receivemessage", (msg) => {
  console.log(`\n📩 ${msg.senderId.firstName}: ${msg.text}`);
  socket.emit("messagedelivered", { messageId: msg._id });

  rl.prompt();
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
  rl.close();
});
