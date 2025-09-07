import express from "express";
import path from "path";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import Listing from "../models/listing.js";
import { isLoggedIn, isOwner, validateListing } from "../middleware.js";
import {
  index,
  userListings,
  getSearchSuggestions,
  renderNewForm,
  showListing,
  createListing,
  editListing,
  updateListing,
  destroyListing,
} from "../controllers/listings.js";

// --------- Multer Setup (File Upload) ----------
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure "uploads/" folder exists
  },
  filename: function (req, file, cb) {
    // Ensure the file has a proper extension
    const ext = path.extname(file.originalname) || '.jpg';
    const name = path.basename(file.originalname, ext);
    cb(null, Date.now() + "-" + name + ext);
  },
});

const upload = multer({ storage });
// ----------------------------------------------

router
  .route("/")
  .get(wrapAsync(index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"), // ✅ now upload is defined
    validateListing,
    wrapAsync(createListing)
  );

// CREATE NEW LISTING FORM
router.get("/new", isLoggedIn, renderNewForm);

// USER'S OWN LISTINGS
router.get("/my", isLoggedIn, wrapAsync(userListings));

// SEARCH SUGGESTIONS API
router.get("/api/suggestions", wrapAsync(getSearchSuggestions));

router
  .route("/:id")
  .get(wrapAsync(showListing))
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(updateListing));

// RENDER EDIT LISTING PAGE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(editListing));

// DELETE ROUTE
router.delete("/:id/delete", isLoggedIn, isOwner, wrapAsync(destroyListing));

export default router;
