import mongoose from "mongoose";
const Schema = mongoose.Schema;
import Review from "./review.js";

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1739866669727-8d75caed31a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1739866669727-8d75caed31a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D"
        : v,
  },
  //v = value here
  price: Number,
  location: String,
  country: String,

  // New fields for enhanced functionality
  category: {
    type: String,
    enum: ["Apartment", "House", "Villa", "Cabin", "Condo", "Studio", "Other"],
    default: "Other",
  },
  amenities: [
    {
      type: String,
      enum: [
        "WiFi",
        "Kitchen",
        "Washing Machine",
        "Air Conditioning",
        "Heating",
        "TV",
        "Parking",
        "Gym",
        "Pool",
        "Garden",
        "Balcony",
        "Pet Friendly",
        "Breakfast Included",
      ],
    },
  ],
  capacity: {
    type: Number,
    min: 1,
    default: 2,
  },
  bedrooms: {
    type: Number,
    min: 0,
    default: 1,
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 1,
  },
  availableFrom: {
    type: Date,
    default: Date.now,
  },
  availableTo: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
