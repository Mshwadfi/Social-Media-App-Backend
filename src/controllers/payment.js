const crypto = require("crypto");

const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const order = require("../models/order");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { amount, currency } = req.body;
  if (!amount || !currency) {
    return next(new AppError("Amount and currency are required", 400));
  }
  const user = req.user;
  if (!user) {
    return next(new AppError("User not authenticated", 401));
  }
  if (user.isPremium) {
    return res.status(200).json({
      message: "User is already premium. No new order created.",
      premium: true,
    });
  }

  let existingOrder = await order.findOne({
    user: user._id,
    amount: amount * 100,
    currency,
    status: { $in: ["initiated", "pending"] },
  });

  if (existingOrder) {
    console.log("ℹ️ Reusing pending order:", existingOrder._id);
    return res.status(200).json({
      message: "Pending order already exists",
      order: existingOrder,
    });
  }

  // first create order in db then update it with paymob details after creating intention, if fails mark order as failed
  let newOrder = await order.create({
    user: user._id,
    amount: amount * 100,
    currency,
    status: "initiated",
  });

  try {
    const intention = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: currency || "EGP",
        payment_methods: [parseInt(process.env.PAYMOB_INTEGRATION_ID), "card"],
        merchant_order_id: newOrder._id.toString(),
        items: [
          {
            name: "Premium Subscription",
            amount: amount * 100,
            description: "Subscription plan",
            quantity: 1,
          },
        ],
        billing_data: {
          apartment: "N/A",
          email: user.email,
          floor: "N/A",
          first_name: user.firstName || "User",
          street: "N/A",
          building: "N/A",
          phone_number: user.phone || "+201000000000",
          shipping_method: "N/A",
          postal_code: "N/A",
          city: "Cairo",
          country: "EG",
          last_name: "Premium",
          state: "Cairo",
        },
        customer: {
          first_name: user.firstName || "User",
          last_name: user.lastName || "",
          email: user.email,
          extras: { userId: user._id.toString() },
        },
        extras: {
          source: "backend",
        },
      }),
    });

    const intentionData = await intention.json();

    newOrder.paymobOrderId = intentionData.intention_order_id;
    newOrder.transactionId = intentionData.id;
    newOrder.status = "pending";
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
      paymob: intentionData,
    });
  } catch (error) {
    newOrder.status = "failed";
    await newOrder.save();

    return next(new AppError("Failed to create Paymob order", 500));
  }
});

exports.verifyOrder = asyncHandler(async (req, res, next) => {
  console.log("📩 Webhook received:", req.body);
  console.log("📩 Webhook received:", req.query);

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const receivedHmac = req.body.hmac || req.query.hmac;
  const data = req.body.obj;

  // HMAC validation
  const fields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  // Build concatenated string
  const concatenated = fields
    .map((field) => {
      const parts = field.split(".");
      let val = data;
      for (let p of parts) val = val?.[p];
      return val?.toString() || "";
    })
    .join("");

  const hmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  console.log("🔑 Received HMAC:", receivedHmac);
  console.log("🔑 Generated HMAC:", hmac);

  if (hmac !== receivedHmac) {
    console.log("❌ Invalid HMAC");
    return next(new AppError("Invalid HMAC", 400));
  }

  // const paymobTx = await fetch(
  //   `https://accept.paymob.com/v1/transaction/${data.id}`,
  //   { headers: { Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}` } }
  // ).then((r) => r.json());
  // console.log("🔍 Paymob TX API response:", paymobTx);

  // if (!paymobTx.success) {
  //   console.log("❌ Transaction not successful at Paymob");
  //   return res.status(200).json({ message: "Payment not successful" });
  // }

  // ✅ Valid request
  if (data?.success) {
    const paymobOrderId = data.order?.id;
    // using transaction so we either update both order and user or none, with out it we may uptate order but fail to update user
    // and user will not get premium even though payment was successful
    // and if we update user but fail to update order, user may get premium without successful payment
    // so transaction is must here
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("orderId: ", paymobOrderId);
    try {
      const updatedOrder = await order.findOneAndUpdate(
        { paymobOrderId, status: { $ne: "paid" } },
        { status: "paid" },
        { new: true, session }
      );
      console.log("updatedOrder: ", updatedOrder);
      if (!updatedOrder) {
        console.log("ℹ️ Order already paid or not found");
        await session.abortTransaction();
        return res.status(200).json({ message: "Already processed" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        updatedOrder.user,
        { isPremium: true },
        { new: true, session }
      );

      console.log("updatedUser: ", updatedUser);
      await session.commitTransaction();
      session.endSession();

      console.log(`✅ Payment success for user ${updatedOrder.user}`);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Error updating order/user:", err);
      return next(new AppError("Database error while processing payment", 500));
    }
  } else {
    console.log("❌ Payment failed", data);
  }

  res.status(200).json({ message: "Webhook processed" });
});
