const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "invalid objectId for user",
      },
    },
    content: {
      type: String,
      maxLength: 1000,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    impressions: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

postSchema.pre("validate", function (next) {
  if (!this.content && !this.image) {
    this.invalidate("content", "Post must contain either content or an image.");
  }
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
