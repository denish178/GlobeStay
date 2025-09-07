import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema({
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "inr",
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "wallet"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
  },
  transactionId: {
    type: String,
    unique: true,
  },
  stripePaymentIntentId: {
    type: String,
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    upiId: String,
    bankName: String,
  },
  metadata: {
    guestName: String,
    guestEmail: String,
    listingTitle: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate transaction ID
paymentSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId =
      "TXN" +
      Date.now() +
      Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);
