const crypto = require("crypto");

const { asyncHandler, AppError } = require("../middlewares/errorHandler");

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { amount, currency } = req.body;
  if (!amount || !currency) {
    return next(new AppError("Amount and currency are required", 400));
  }
  const user = req.user;
  if (!user) {
    return next(new AppError("User not authenticated", 401));
  }
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
      merchant_order_id: user._id.toString(),
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
  console.log(intentionData);
  res
    .status(201)
    .json({ message: "Order created successfully", data: intentionData });
});

exports.verifyOrder = asyncHandler(async (req, res, next) => {
  console.log("📩 Webhook received:", req.body);
  console.log("📩 Webhook received (query):", req.query);

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const receivedHmac = req.body.hmac || req.query.hmac;
  const data = req.body.obj;

  // Fields order required by Paymob docs
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

  // Generate HMAC
  const hmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  if (hmac !== receivedHmac) {
    console.log("❌ Invalid HMAC");
    return next(new AppError("Invalid HMAC", 400));
  }

  // ✅ Valid request
  if (data.success) {
    const userId = data.order?.merchant_order_id;
    console.log(`✅ Payment success for user ${userId}`);
    // TODO: update user in DB -> isPremium = true
  } else {
    console.log("❌ Payment failed", data);
  }

  res.status(200).json({ message: "Webhook received" });
});
