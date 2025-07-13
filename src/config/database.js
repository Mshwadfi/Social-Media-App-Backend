const mongoose = require("mongoose");

connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

module.exports = connectDB;
