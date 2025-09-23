const { io } = require("socket.io-client");
const readline = require("readline");

// Setup readline for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = io("http://localhost:4000");

// creat simple roomid: we need to change this later with some thing robust maybe uuid
const roomId = ["user1", "user2"].sort().join("_");
const userId = "user1";

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Join the room
  socket.emit("joinchat", { roomId, userId });
  console.log(`🟢 Joined room: ${roomId} as ${userId}`);

  // Prompt user for input
  rl.setPrompt("💬 Enter message: ");
  rl.prompt();

  // On user input, send message
  rl.on("line", (line) => {
    const message = {
      roomId,
      senderId: userId,
      text: line.trim(),
      timestamp: Date.now(),
    };

    socket.emit("sendmessage", message);
    rl.prompt();
  });
});

// Listen for incoming messages
socket.on("receivemessage", (msg) => {
  console.log(`\n📩 ${msg.senderId}: ${msg.text}`);
  rl.prompt();
});

// Handle disconnect
socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
  rl.close();
});
