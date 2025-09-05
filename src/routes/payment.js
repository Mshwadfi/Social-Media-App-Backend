const express = require("express");
const { authMiddleWare } = require("../middlewares/auth");
const { createOrder } = require("../controllers/payment");
const paymentRouter = express.Router();

paymentRouter.post("/create-order", authMiddleWare, createOrder);

module.exports = paymentRouter;
