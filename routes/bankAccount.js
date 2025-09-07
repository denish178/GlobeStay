import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn } from "../middleware.js";
import {
  addBankAccount,
  renderBankAccountForm,
  getUserBankAccounts,
  showBankAccount,
  renderEditBankAccountForm,
  updateBankAccount,
  activateBankAccount,
  deleteBankAccount,
} from "../controllers/bankAccounts.js";

// Show user's bank accounts
router.get("/", isLoggedIn, wrapAsync(getUserBankAccounts));

// Show bank account form
router.get("/new", isLoggedIn, renderBankAccountForm);

// Add new bank account
router.post("/", isLoggedIn, wrapAsync(addBankAccount));

// Show specific bank account
router.get("/:accountId", isLoggedIn, wrapAsync(showBankAccount));

// Show edit bank account form
router.get(
  "/:accountId/edit",
  isLoggedIn,
  wrapAsync(renderEditBankAccountForm)
);

// Update bank account
router.put("/:accountId", isLoggedIn, wrapAsync(updateBankAccount));

// Activate bank account
router.patch("/:accountId/activate", isLoggedIn, wrapAsync(activateBankAccount));

// Delete bank account
router.delete("/:accountId", isLoggedIn, wrapAsync(deleteBankAccount));

export default router;
