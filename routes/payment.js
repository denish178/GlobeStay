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
router.post("/create-intent", isLoggedIn, wrapAsync(createPaymentIntent));

// Process payment completion
router.post("/process", isLoggedIn, wrapAsync(processPayment));

// Get payment status
router.get("/status/:paymentId", isLoggedIn, wrapAsync(getPaymentStatus));

// Process UPI payment
router.post("/upi", isLoggedIn, wrapAsync(processUPIPayment));

// Get user payment history
router.get("/history", isLoggedIn, wrapAsync(getUserPayments));

export default router;
