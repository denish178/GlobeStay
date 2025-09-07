import express from "express";
const router = express.Router({ mergeParams: true });
import User from "../models/user.js";
import wrapAsync from "../utils/wrapAsync.js";
import passport from "passport";
import { savedRedirectUrl, isLoggedIn } from "../middleware.js";
import multer from "multer";
import {
  signup,
  rednerSignupForm,
  renderLoginForm,
  login,
  logout,
  renderProfile,
  updateProfile,
  uploadProfileImage,
} from "../controllers/users.js";

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

router.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

router.route("/signup").get(rednerSignupForm).post(signup);

router
  .route("/login")
  .get(renderLoginForm)
  .post(
    savedRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

// Google OAuth Routes
router.get("/auth/google", 
  passport.authenticate("google", { 
    scope: ["profile", "email"] 
  })
);

router.get("/auth/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "/login",
    failureFlash: true 
  }),
  (req, res) => {
    req.flash("success", "Welcome to GlobeStay!");
    res.redirect("/listings");
  }
);

// Logout Route
router.get("/logout", logout);

// Profile Routes
router.get("/profile", isLoggedIn, renderProfile);
router.post("/profile", isLoggedIn, (req, res, next) => {
  console.log("Profile POST route hit:", {
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user ? req.user._id : "No user"
  });
  next();
}, updateProfile);
router.post("/profile/upload-image", isLoggedIn, (req, res, next) => {
  console.log("Multer middleware starting...");
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      const errorMessage = err.message || "File upload error";
      req.flash("error", "File upload error: " + errorMessage);
      return res.redirect("/profile");
    }
    console.log("Multer middleware completed successfully");
    next();
  });
}, uploadProfileImage);

// Test route for debugging uploads
router.post("/test-upload", isLoggedIn, upload.single("testFile"), (req, res) => {
  console.log("Test upload received:", {
    file: req.file,
    body: req.body
  });
  res.json({
    success: true,
    file: req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null
  });
});

export default router;
