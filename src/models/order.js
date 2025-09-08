const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EGP" },
    status: {
      type: String,
      enum: ["initiated", "pending", "paid", "failed"],
      default: "pending",
    },
    paymobOrderId: { type: String },
    transactionId: { type: String },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
