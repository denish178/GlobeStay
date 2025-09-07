import User from "../models/user.js";
import { cloudinary } from "../cloudConfig.js";
import { v2 as cloudinaryV2 } from "cloudinary";

export const rednerSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

export const renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

export const login = async (req, res) => {
  req.flash("success", "Welcome back!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    const newUser = new User({
      email,
      username,
      firstName,
      lastName,
    });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to GlobeStay");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Profile Management Functions
export const renderProfile = (req, res) => {
  res.render("users/profile.ejs", { user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received:", {
      body: req.body,
      user: req.user ? req.user._id : "No user"
    });
    
    const { firstName, lastName, email, phone, bio, location, username } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found:", req.user._id);
      req.flash("error", "User not found");
      return res.redirect("/profile");
    }

    // Check if username is being changed and validate uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username });
      if (existingUser) {
        req.flash("error", "Username already exists. Please choose a different username.");
        return res.redirect("/profile");
      }
      
      // Validate username format (alphanumeric and underscores only)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        req.flash("error", "Username can only contain letters, numbers, and underscores.");
        return res.redirect("/profile");
      }
      
      // Validate username length
      if (username.length < 3 || username.length > 20) {
        req.flash("error", "Username must be between 3 and 20 characters long.");
        return res.redirect("/profile");
      }
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.username = username || user.username;

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    req.flash("error", "Failed to update profile: " + error.message);
    res.redirect("/profile");
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    console.log("Upload request received:", {
      file: req.file,
      user: req.user ? req.user._id : "No user",
      body: req.body
    });

    if (!req.file) {
      console.log("No file provided in request");
      req.flash("error", "No image file provided");
      return res.redirect("/profile");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found:", req.user._id);
      req.flash("error", "User not found");
      return res.redirect("/profile");
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
      // Fallback: use local file path
      user.profileImage = `/uploads/${req.file.filename}`;
      await user.save();
      req.flash("success", "Profile picture updated successfully!");
      return res.redirect("/profile");
    }

    // Upload to Cloudinary
    const result = await cloudinaryV2.uploader.upload(req.file.path, {
      folder: "globestay/profiles",
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "face",
      quality: "auto",
      fetch_format: "auto"
    });

    // Delete old profile image if it's not the default
    if (user.profileImage && !user.profileImage.includes("unsplash.com") && !user.profileImage.startsWith("/uploads/")) {
      try {
        const publicId = user.profileImage.split("/").pop().split(".")[0];
        await cloudinaryV2.uploader.destroy(`globestay/profiles/${publicId}`);
      } catch (deleteError) {
        console.log("Could not delete old image:", deleteError.message);
      }
    }

    // Update user profile image
    user.profileImage = result.secure_url;
    await user.save();

    req.flash("success", "Profile picture updated successfully!");
    res.redirect("/profile");
  } catch (error) {
    console.error("Upload profile image error:", error);
    const errorMessage = error.message || "Unknown error occurred";
    req.flash("error", "Failed to upload profile image: " + errorMessage);
    res.redirect("/profile");
  }
};
