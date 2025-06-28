const { default: mongoose } = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid ObjectId For User1",
      },
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid ObjectId For User2",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Connection", connectionSchema);
