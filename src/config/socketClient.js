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
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFobWVkZW1hZEBnc3Nkc21haWwuY29tIiwiX2lkIjoiNjg1ODA4MzU3ODg0NjUxNzQzODdlNGQ5IiwiaWF0IjoxNzU4NzE5NDMzLCJleHAiOjE3NTkzMjQyMzN9.4GV4GQevC0GFvZzYqpO8Ux0ZI16NExxTEC4R4HXrJb4",
  },
});

// creat simple roomid: we need to change this later with some thing robust maybe uuid
let roomId = "68d40e1ce0abd6659508feb6";

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Join room
  socket.emit("joinchat", { roomId });

  socket.on("roomcreated", ({ roomId: newRoomId }) => {
    roomId = newRoomId; // 👈 save globally
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

  // socket.emit("joinchat", { roomId });
  // console.log(`🟢 Joined room: ${roomId}`);

  // Prompt user for input
  rl.setPrompt("💬 Enter message: ");
  rl.prompt();

  rl.on("line", (line) => {
    const message = {
      roomId,
      text: line.trim(),
      recieverId: "6854672d1b20b450552e4077",
    };

    socket.emit("sendmessage", message);
    rl.prompt();
  });
});

socket.on("receivemessage", (msg) => {
  console.log(`\n📩 ${msg.senderId.firstName}: ${msg.text}`);
  socket.emit("messagedelivered", { messageId: msg._id });

  console.log(`😂 ${msg}`);
  rl.prompt();
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
  rl.close();
});
