import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn } from "../middleware.js";
import {
  getUserPayouts,
  showPayout,
  processPendingPayouts,
  getPayoutStats,
} from "../controllers/payouts.js";

// Show user's payouts
router.get("/", isLoggedIn, wrapAsync(getUserPayouts));

// Get payout statistics
router.get("/stats", isLoggedIn, wrapAsync(getPayoutStats));

// Process pending payouts (admin function)
router.post("/process", isLoggedIn, wrapAsync(processPendingPayouts));

// Show specific payout
router.get("/:payoutId", isLoggedIn, wrapAsync(showPayout));

export default router;
