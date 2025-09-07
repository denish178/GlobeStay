import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn, validateBooking } from "../middleware.js";
import {
  createBooking,
  showBooking,
  userBookings,
  cancelBooking,
  renderBookingForm,
  renderPaymentPage,
  renderPaymentSuccess,
} from "../controllers/bookings.js";

// Show user's bookings
router.get("/", isLoggedIn, wrapAsync(userBookings));

// Show booking form for a specific listing
router.get("/new/:id", isLoggedIn, wrapAsync(renderBookingForm));

// Create new booking
router.post("/:id", isLoggedIn, validateBooking, wrapAsync(createBooking));

// Show specific booking
router.get("/:bookingId", isLoggedIn, wrapAsync(showBooking));

// Show payment page for booking
router.get("/:bookingId/payment", isLoggedIn, wrapAsync(renderPaymentPage));

// Show payment success page
router.get("/payment/success", isLoggedIn, wrapAsync(renderPaymentSuccess));

// Cancel booking
router.delete("/:bookingId", isLoggedIn, wrapAsync(cancelBooking));

export default router;
