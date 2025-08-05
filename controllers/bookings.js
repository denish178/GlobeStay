import Booking from "../models/booking.js";
import Listing from "../models/listing.js";
import ExpressError from "../utils/ExpressError.js";

// Create a new booking
export const createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests, specialRequests } = req.body.booking;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Calculate total price based on nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * listing.price;

  const booking = new Booking({
    listing: id,
    guest: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: Number(guests),
    totalPrice,
    specialRequests: specialRequests || "",
  });

  await booking.save();
  req.flash(
    "success",
    "Booking created successfully! Please complete payment."
  );
  res.redirect(`/bookings/${booking._id}/payment`);
};

// Show booking details
export const showBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("guest");

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/bookings");
  }

  res.render("bookings/show", { booking });
};

// Show user's bookings
export const userBookings = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index", { bookings });
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/bookings");
  }

  if (!booking.guest.equals(req.user._id)) {
    req.flash("error", "You can only cancel your own bookings!");
    return res.redirect("/bookings");
  }

  booking.status = "cancelled";
  await booking.save();

  req.flash("success", "Booking cancelled successfully!");
  res.redirect("/bookings");
};

// Show booking form
export const renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("bookings/new", { listing });
};

// Show payment page for booking
export const renderPaymentPage = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("guest");

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/bookings");
  }

  if (!booking.guest.equals(req.user._id)) {
    req.flash("error", "You can only pay for your own bookings!");
    return res.redirect("/bookings");
  }

  res.render("bookings/payment", { booking });
};

// Show payment success page
export const renderPaymentSuccess = async (req, res) => {
  const { transactionId, amount, paymentMethod } = req.query;

  res.render("bookings/payment-success", {
    transactionId,
    amount: parseFloat(amount),
    paymentMethod,
  });
};
