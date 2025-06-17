const mongoose = require("mongoose");

connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://mohamedalshwadfy24:rbzIt6plx9KBI3cy@namastenode.hciz9mt.mongodb.net/devSocial"
  );
};

module.exports = connectDB;
