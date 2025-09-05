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
        first_name: user.username || "User",
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
        first_name: user.username || "User",
        last_name: "Premium",
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
