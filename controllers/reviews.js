import Listing from "../models/listing.js";
import Review from "../models/review.js";
import { updateListingRating } from "./listings.js";

export const createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  // Update listing rating
  await updateListingRating(listing._id);

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

export const destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  // Update listing rating
  await updateListingRating(id);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
