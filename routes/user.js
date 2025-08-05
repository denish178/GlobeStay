import express from "express";
const router = express.Router({ mergeParams: true });
import User from "../models/user.js";
import wrapAsync from "../utils/wrapAsync.js";
import passport from "passport";
import { savedRedirectUrl } from "../middleware.js";
import { isLoggedIn } from "../middleware.js";
import {
  signup,
  rednerSignupForm,
  renderLoginForm,
  login,
  logout,
} from "../controllers/users.js";

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

// Logout Route
router.get("/logout", logout);

export default router;
