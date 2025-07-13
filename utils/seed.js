const mongoose = require("mongoose");
const Post = require("../src/models/post");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    seedPosts();
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err);
  });

// Seed Data
const posts = [
  {
    userId: "6854672d1b20b450552e4077",
    content: "First post from ghh",
  },
  {
    userId: "6854672d1b20b450552e4077",
    content: "Second post from ghh with an image",
    image: "https://example.com/image1.jpg",
  },
  {
    userId: "68580835788465174387e4d9",
    content: "abdullah's first post",
  },
  {
    userId: "68580835788465174387e4d9",
    content: "abdullah's post with an image",
    image: "https://example.com/image2.jpg",
  },
  {
    userId: "6854672d1b20b450552e4077",
    content: "A random thought from ghh",
  },
];

async function seedPosts() {
  try {
    await Post.deleteMany(); // Clear posts collection before seeding
    await Post.insertMany(posts);
    console.log("Posts seeded successfully");
  } catch (error) {
    console.error("Error seeding posts:", error);
  } finally {
    mongoose.disconnect();
  }
}
