import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import Listing from "../models/listing.js";
import { isLoggedIn, isOwner, validateListing } from "../middleware.js";
import {
  index,
  renderNewForm,
  showListing,
  createListing,
  editListing,
  updateListing,
  destroyListing,
} from "../controllers/listings.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

router
  .route("/")
  .get(wrapAsync(index))
  .post(
    upload.single("listing[image]"),
    isLoggedIn,
    validateListing,
    wrapAsync(createListing)
  );

// CREATE NEW LISTING FORM
router.get("/new", isLoggedIn, renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(showListing))
  .put(isLoggedIn, isOwner, validateListing, wrapAsync(updateListing));

// RENDER EDIT LISTING PAGE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(editListing));

// DELETE ROUTE
router.delete("/:id/delete", isLoggedIn, isOwner, wrapAsync(destroyListing));

export default router;
