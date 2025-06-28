const { default: mongoose } = require("mongoose");

const connectionsSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: function (value) {
        return mongoose.Schema.Types.ObjectId.isvalid(value);
      },
      message: "Invalid ObjectId For User1",
    },
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: function (value) {
        return mongoose.Schema.Types.ObjectId.isvalid(value);
      },
      message: "Invalid ObjectId For User2",
    },
  },
});

module.exports = mongoose.model("Connections", connectionsSchema);
