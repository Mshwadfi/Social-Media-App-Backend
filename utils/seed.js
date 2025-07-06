const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config(); // to use your .env Mongo URI

const User = require("../src/models/user"); // adjust path if needed
const Connection = require("../src/models/connection");
const ConnectionRequest = require("../src/models/connectionRequest");

const { ObjectId } = mongoose.Types;

const users = [
  {
    _id: new ObjectId("665000000000000000000001"),
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    password: "Alice12345!",
    age: 28,
    gender: "female",
  },
  {
    _id: new ObjectId("665000000000000000000002"),
    firstName: "Bob",
    lastName: "Jones",
    email: "bob@example.com",
    password: "Bob12345!",
    age: 32,
    gender: "male",
  },
  {
    _id: new ObjectId("665000000000000000000003"),
    firstName: "Charlie",
    lastName: "Brown",
    email: "charlie@example.com",
    password: "Charlie123!",
    age: 29,
    gender: "male",
  },
  {
    _id: new ObjectId("665000000000000000000004"),
    firstName: "David",
    lastName: "Lee",
    email: "david@example.com",
    password: "David12345!",
    age: 34,
    gender: "male",
  },
  {
    _id: new ObjectId("665000000000000000000005"),
    firstName: "Eve",
    lastName: "Miller",
    email: "eve@example.com",
    password: "Eve12345!",
    age: 27,
    gender: "female",
  },
  {
    _id: new ObjectId("665000000000000000000006"),
    firstName: "Faythe",
    lastName: "Moore",
    email: "faythe@example.com",
    password: "Faythe123!",
    age: 30,
    gender: "female",
  },
  {
    _id: new ObjectId("665000000000000000000007"),
    firstName: "Grace",
    lastName: "Taylor",
    email: "grace@example.com",
    password: "Grace12345!",
    age: 26,
    gender: "female",
  },
  {
    _id: new ObjectId("665000000000000000000008"),
    firstName: "Heidi",
    lastName: "Anderson",
    email: "heidi@example.com",
    password: "Heidi12345!",
    age: 31,
    gender: "female",
  },
  {
    _id: new ObjectId("665000000000000000000009"),
    firstName: "Ivan",
    lastName: "Thomas",
    email: "ivan@example.com",
    password: "Ivan12345!",
    age: 35,
    gender: "male",
  },
  {
    _id: new ObjectId("66500000000000000000000a"),
    firstName: "Judy",
    lastName: "White",
    email: "judy@example.com",
    password: "Judy12345!",
    age: 29,
    gender: "female",
  },
];

const connections = [
  { user1: users[0]._id, user2: users[1]._id }, // Alice - Bob
  { user1: users[1]._id, user2: users[2]._id }, // Bob - Charlie
  { user1: users[2]._id, user2: users[3]._id }, // Charlie - David
  { user1: users[3]._id, user2: users[4]._id }, // David - Eve
  { user1: users[0]._id, user2: users[5]._id }, // Alice - Faythe
  { user1: users[5]._id, user2: users[6]._id }, // Faythe - Grace
  { user1: users[6]._id, user2: users[7]._id }, // Grace - Heidi
  { user1: users[1]._id, user2: users[8]._id }, // Bob - Ivan
  { user1: users[8]._id, user2: users[9]._id }, // Ivan - Judy
];

const connectionRequests = [
  {
    senderId: users[2]._id, // Charlie
    receiverId: users[5]._id, // Faythe
    status: "pending",
  },
  {
    senderId: users[7]._id, // Heidi
    receiverId: users[4]._id, // Eve
    status: "pending",
  },
  {
    senderId: users[9]._id, // Judy
    receiverId: users[0]._id, // Alice
    status: "pending",
  },
];

async function seed() {
  try {
    await mongoose.connect(
      "mongodb+srv://mohamedalshwadfy24:rbzIt6plx9KBI3cy@namastenode.hciz9mt.mongodb.net/devSocial"
    );
    console.log("Connected to MongoDB");

    // Hash passwords
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    // Insert users (skip duplicates using upsert)
    for (let user of users) {
      await User.updateOne({ _id: user._id }, user, { upsert: true });
    }

    // Insert connections
    for (let conn of connections) {
      const exists = await Connection.findOne({
        $or: [
          { user1: conn.user1, user2: conn.user2 },
          { user1: conn.user2, user2: conn.user1 },
        ],
      });

      if (!exists) await Connection.create(conn);
    }

    // Insert connection requests
    for (let req of connectionRequests) {
      const exists = await ConnectionRequest.findOne({
        senderId: req.senderId,
        receiverId: req.receiverId,
      });

      if (!exists) await ConnectionRequest.create(req);
    }

    console.log("✅ Seeding completed without deleting existing data.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
