// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Core Modules
import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import methodOverride from "method-override";

// View Engine
import ejsMate from "ejs-mate";

// Routers
import listingsRouter from "./routes/listing.js";
import reviewsRouter from "./routes/review.js";
import userRouter from "./routes/user.js";
import bookingRouter from "./routes/booking.js";
import paymentRouter from "./routes/payment.js";
import bankAccountRouter from "./routes/bankAccount.js";
import payoutRouter from "./routes/payout.js";

// Session and Auth
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// Models
import User from "./models/user.js";

// Express App Init
const app = express();

// MongoDB Connection
const MONGO_URL = process.env.ATLASDB_URL;
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// __dirname workaround (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and Auth Locals Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("I AM ROOT!");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/bookings", bookingRouter);
app.use("/payments", paymentRouter);
app.use("/bank-accounts", bankAccountRouter);
app.use("/payouts", payoutRouter);
app.use("/", userRouter);

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  const message = err.message || "Something went wrong";
  res.status(statusCode).render("error.ejs", { err });
});

// Server Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
