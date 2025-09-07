import Payment from "../models/payment.js";
import Booking from "../models/booking.js";
import Listing from "../models/listing.js";
import Stripe from "stripe";
import { createPayout } from "./payouts.js";

// Initialize Stripe with your secret key
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_your_test_key_here"
);

// Create payment intent for Stripe
export const createPaymentIntent = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to make a payment" });
    }

    const { bookingId, paymentMethod } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Debug logging
    console.log("🔍 Payment creation debug:", {
      bookingId,
      paymentMethod,
      totalPrice: booking.totalPrice,
      user: {
        id: req.user?._id,
        username: req.user?.username,
        email: req.user?.email
      },
      listingTitle: booking.listing?.title
    });

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      amount: booking.totalPrice,
      paymentMethod: paymentMethod,
      metadata: {
        guestName: req.user?.username || 'Unknown',
        guestEmail: req.user?.email || 'unknown@example.com',
        listingTitle: booking.listing?.title || 'Unknown Listing',
      },
    });

    try {
      await payment.save();
      console.log("✅ Payment record created successfully:", payment._id);
    } catch (saveError) {
      console.error("❌ Payment save error:", saveError);
      throw saveError;
    }

    // For Stripe payments, create payment intent
    if (paymentMethod === "card") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents
        currency: "inr",
        metadata: {
          bookingId: bookingId,
          paymentId: payment._id.toString(),
          guestName: req.user.username,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update payment with Stripe payment intent ID
      payment.stripePaymentIntentId = paymentIntent.id;
      await payment.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        amount: booking.totalPrice,
      });
    } else {
      // For non-Stripe payments, return payment ID directly
      res.json({
        paymentId: payment._id,
        amount: booking.totalPrice,
      });
    }
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res
      .status(500)
      .json({ error: "Failed to create payment intent: " + error.message });
  }
};

// Process payment completion
export const processPayment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to make a payment" });
    }

    const { paymentId, paymentMethod, paymentDetails } = req.body;

    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Update payment details based on method
    if (paymentMethod === "card") {
      payment.paymentDetails = {
        cardLast4: paymentDetails.last4,
        cardBrand: paymentDetails.brand,
      };
    } else if (paymentMethod === "upi") {
      payment.paymentDetails = {
        upiId: paymentDetails.upiId,
      };
    } else if (paymentMethod === "netbanking") {
      payment.paymentDetails = {
        bankName: paymentDetails.bankName,
      };
    }

    payment.paymentStatus = "completed";
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking._id);
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();

    // Create payout for property owner
    try {
      await createPayout(payment._id);
    } catch (payoutError) {
      console.error("Payout creation failed:", payoutError);
      // Don't fail the payment if payout creation fails
    }

    res.json({
      success: true,
      message: "Payment completed successfully",
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({
      paymentStatus: payment.paymentStatus,
      amount: payment.amount,
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ error: "Failed to get payment status" });
  }
};

// Process UPI payment (simulated)
export const processUPIPayment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to make a payment" });
    }

    const { paymentId, upiId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    if (!upiId) {
      return res.status(400).json({ error: "UPI ID is required" });
    }

    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if payment is already completed
    if (payment.paymentStatus === "completed") {
      return res.status(400).json({ error: "Payment is already completed" });
    }

    // Simulate UPI payment processing with a small delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate UPI payment processing
    payment.paymentDetails = { upiId };
    payment.paymentStatus = "completed";
    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.booking._id);
    if (booking) {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      await booking.save();
    }

    // Create payout for property owner
    try {
      await createPayout(payment._id);
    } catch (payoutError) {
      console.error("Payout creation failed:", payoutError);
      // Don't fail the payment if payout creation fails
    }

    res.json({
      success: true,
      message: "UPI payment completed successfully",
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("UPI payment error:", error);
    res
      .status(500)
      .json({ error: "Failed to process UPI payment: " + error.message });
  }
};

// Get payment history for user
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: "booking",
        populate: { path: "listing" },
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: "Failed to get payments" });
  }
};
