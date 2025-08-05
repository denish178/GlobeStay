import mongoose from "mongoose";
import Listing from "../models/listing.js";
import initData from "./data.js";
import User from "../models/user.js";

mongoose
  .connect("mongodb://127.0.0.1:27017/Wanderlust")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const initDatabase = async () => {
  try {
    // Delete existing listings
    await Listing.deleteMany({});
    console.log("Existing listings deleted");
    await User.deleteMany({});

    // Update all listings to have the correct owner ID
    const user = new User({ username: "john", email: "john@example.com" });
    const registeredUser = await User.register(user, "john123");

    const updatedData = initData.data.map((obj) => ({
      ...obj,
      owner: registeredUser._id,
    }));

    // Insert updated listings
    await Listing.insertMany(updatedData);
    console.log("DATA WAS INITIALIZED");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    mongoose.connection.close(); // Close connection after seeding
  }
};

initDatabase();
