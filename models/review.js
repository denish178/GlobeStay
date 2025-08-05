import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing", // 👈 kis listing pe ye review diya gaya
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Review", reviewSchema);
