import express from "express";
const router = express.Router({ mergeParams: true });
import wrapAsync from "../utils/wrapAsync.js";
import ExpressError from "../utils/ExpressError.js";
import Review from "../models/review.js";
import Listing from "../models/listing.js";
import { validateReview, isLoggedIn, isReviewAuthor } from "../middleware.js";
import { createReview, destroyReview } from "../controllers/reviews.js";

//Reviews post route
router.post("/", isLoggedIn, validateReview, wrapAsync(createReview));

//Delete review route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(destroyReview)
);

export default router;
