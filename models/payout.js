import mongoose from "mongoose";

const { Schema } = mongoose;

const payoutSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  payment: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  bankAccount: {
    type: Schema.Types.ObjectId,
    ref: "BankAccount",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "cancelled"],
    default: "pending",
  },
  payoutMethod: {
    type: String,
    enum: ["bank_transfer", "upi", "cheque"],
    default: "bank_transfer",
  },
  transactionId: {
    type: String,
    unique: true,
  },
  scheduledDate: {
    type: Date,
    default: Date.now,
  },
  processedDate: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
  metadata: {
    bankTransactionId: String,
    utrNumber: String,
    remarks: String,
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
payoutSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate transaction ID
payoutSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId =
      "POUT" +
      Date.now() +
      Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model("Payout", payoutSchema);
