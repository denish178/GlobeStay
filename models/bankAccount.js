import mongoose from "mongoose";

const { Schema } = mongoose;

const bankAccountSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  branchName: {
    type: String,
    default: "",
  },
  accountType: {
    type: String,
    enum: ["savings", "current"],
    default: "savings",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
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
bankAccountSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure one active account per user
bankAccountSchema.index(
  { owner: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model("BankAccount", bankAccountSchema);
