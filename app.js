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
import connectMongo from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Models
import User from "./models/user.js";

// Express App Init
const app = express();

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.log("⚠️ MongoDB not available, running without database");
    console.log("To see listings, please install MongoDB or use MongoDB Atlas");
  }
}
main();

// Session Store
let store;
try {
  store = connectMongo.create({
    mongoUrl: MONGO_URL,
    crypto: {
      secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600, // seconds (only update once every 24h if no changes)
  });

  store.on("error", (err) => {
    console.log("❌ ERROR in MONGO SESSION STORE", err);
  });
} catch (err) {
  console.log("⚠️ Using memory store for sessions (MongoDB not available)");
  store = null;
}

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// Local Strategy
passport.use(new LocalStrategy(User.authenticate()));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      return done(null, existingUser);
    }
    
    // Check if user exists with same email
    existingUser = await User.findOne({ email: profile.emails[0].value });
    
    if (existingUser) {
      // Link Google account to existing user
      existingUser.googleId = profile.id;
      existingUser.profileImage = profile.photos[0].value;
      await existingUser.save();
      return done(null, existingUser);
    }
    
    // Create new user
    const newUser = new User({
      googleId: profile.id,
      username: profile.emails[0].value.split('@')[0], // Use email prefix as username
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profileImage: profile.photos[0].value,
      isVerified: true // Google accounts are pre-verified
    });
    
    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and Auth Locals Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Mock data for when MongoDB is not available
const mockListings = [
  {
    _id: "1",
    title: "Cozy Beachfront Cottage",
    description: "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    price: 1500,
    location: "Malibu",
    country: "United States",
    category: "Cottage",
    amenities: ["WiFi", "Kitchen", "Parking", "Pet Friendly"],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    averageRating: 4.5,
    totalReviews: 23,
  },
  {
    _id: "2",
    title: "Modern Loft in Downtown",
    description: "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    price: 1200,
    location: "New York City",
    country: "United States",
    category: "Apartment",
    amenities: ["WiFi", "Kitchen", "Air Conditioning", "TV", "Gym"],
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    averageRating: 4.2,
    totalReviews: 18,
  },
  {
    _id: "3",
    title: "Mountain Retreat",
    description: "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    price: 1000,
    location: "Aspen",
    country: "United States",
    category: "Cabin",
    amenities: ["WiFi", "Kitchen", "Heating", "Parking"],
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    averageRating: 4.8,
    totalReviews: 31,
  },
  {
    _id: "4",
    title: "Historic Villa in Tuscany",
    description: "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    price: 2500,
    location: "Florence",
    country: "Italy",
    category: "Villa",
    amenities: ["WiFi", "Kitchen", "Pool", "Garden", "Parking"],
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    averageRating: 4.9,
    totalReviews: 45,
  },
  {
    _id: "5",
    title: "Secluded Treehouse Getaway",
    description: "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    price: 800,
    location: "Portland",
    country: "United States",
    category: "Cabin",
    amenities: ["WiFi", "Kitchen", "Balcony", "Pet Friendly"],
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    averageRating: 4.6,
    totalReviews: 28,
  },
  {
    _id: "6",
    title: "Beachfront Paradise",
    description: "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    price: 2000,
    location: "Cancun",
    country: "Mexico",
    category: "Condo",
    amenities: ["WiFi", "Kitchen", "Pool", "Air Conditioning", "TV"],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    averageRating: 4.7,
    totalReviews: 52,
  },
  {
    _id: "7",
    title: "Rustic Cabin by the Lake",
    description: "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
    category: "Cabin",
    amenities: ["WiFi", "Kitchen", "Heating", "Parking", "Garden"],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    averageRating: 4.4,
    totalReviews: 19,
  },
  {
    _id: "8",
    title: "Luxury Penthouse with City Views",
    description: "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
    image: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    price: 3500,
    location: "Los Angeles",
    country: "United States",
    category: "Apartment",
    amenities: ["WiFi", "Kitchen", "Air Conditioning", "TV", "Gym", "Pool", "Parking"],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    averageRating: 4.8,
    totalReviews: 67,
  },
  {
    _id: "9",
    title: "Ski-In/Ski-Out Chalet",
    description: "Hit the slopes right from your doorstep in this ski-in/ski-out chalet in the Swiss Alps.",
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    price: 3000,
    location: "Verbier",
    country: "Switzerland",
    category: "Cabin",
    amenities: ["WiFi", "Kitchen", "Heating", "Parking", "Gym"],
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    averageRating: 4.9,
    totalReviews: 41,
  },
  {
    _id: "10",
    title: "Safari Lodge in the Serengeti",
    description: "Experience the thrill of the wild in a comfortable safari lodge. Witness the Great Migration up close.",
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    price: 4000,
    location: "Serengeti National Park",
    country: "Tanzania",
    category: "Lodge",
    amenities: ["WiFi", "Kitchen", "Air Conditioning", "TV", "Breakfast Included"],
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    averageRating: 4.9,
    totalReviews: 38,
  },
  {
    _id: "11",
    title: "Historic Canal House",
    description: "Stay in a piece of history in this beautifully preserved canal house in Amsterdam's iconic district.",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FtcGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    price: 1800,
    location: "Amsterdam",
    country: "Netherlands",
    category: "House",
    amenities: ["WiFi", "Kitchen", "Heating", "TV", "Balcony"],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    averageRating: 4.5,
    totalReviews: 33,
  },
  {
    _id: "12",
    title: "Private Island Retreat",
    description: "Have an entire island to yourself for a truly exclusive and unforgettable vacation experience.",
    image: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9kZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    price: 10000,
    location: "Fiji",
    country: "Fiji",
    category: "Villa",
    amenities: ["WiFi", "Kitchen", "Pool", "Garden", "Breakfast Included"],
    capacity: 12,
    bedrooms: 6,
    bathrooms: 4,
    averageRating: 5.0,
    totalReviews: 15,
  },
  {
    _id: "13",
    title: "Charming Cottage in the Cotswolds",
    description: "Escape to the picturesque Cotswolds in this quaint and charming cottage with a thatched roof.",
    image: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmVhY2glMjB2YWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    price: 1200,
    location: "Cotswolds",
    country: "United Kingdom",
    category: "Cottage",
    amenities: ["WiFi", "Kitchen", "Heating", "Garden", "Parking"],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    averageRating: 4.6,
    totalReviews: 26,
  }
];

// Routes
app.get("/", (req, res) => {
  res.send("🌍 GlobeStay App Running! <br><br> <a href='/listings'>View All Listings</a>");
});

// Privacy and Terms pages
app.get("/privacy", (req, res) => {
  res.render("privacy");
});

app.get("/terms", (req, res) => {
  res.render("terms");
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
  console.log(`🚀 Server running on port ${PORT}`);
});
