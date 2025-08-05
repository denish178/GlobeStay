import User from "../models/user.js";

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
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};
