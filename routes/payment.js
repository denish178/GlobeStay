import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn } from "../middleware.js";
import {
  createPaymentIntent,
  processPayment,
  getPaymentStatus,
  processUPIPayment,
  getUserPayments,
} from "../controllers/payments.js";

// Create payment intent for Stripe
router.post("/create-intent", wrapAsync(createPaymentIntent));

// Process payment completion
router.post("/process", wrapAsync(processPayment));

// Get payment status
router.get("/status/:paymentId", wrapAsync(getPaymentStatus));

// Process UPI payment
router.post("/upi", wrapAsync(processUPIPayment));

// Get user payment history
router.get("/history", wrapAsync(getUserPayments));

export default router;
