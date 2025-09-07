const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const { createOrder, verifyOrder } = require("../controllers/payment");
const paymentRouter = express.Router();

paymentRouter.post("/create-order", authMiddleWare, createOrder);
paymentRouter.post("/verify-order", verifyOrder);
module.exports = paymentRouter;
