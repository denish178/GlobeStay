import Payout from "../models/payout.js";
import Payment from "../models/payment.js";
import Booking from "../models/booking.js";
import BankAccount from "../models/bankAccount.js";

// Create payout when payment is completed
export const createPayout = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate("booking")
      .populate({
        path: "booking",
        populate: { path: "listing" },
      });

    if (!payment || payment.paymentStatus !== "completed") {
      throw new Error("Payment not found or not completed");
    }

    const booking = payment.booking;
    const listing = booking.listing;

    // Find property owner's active bank account
    const bankAccount = await BankAccount.findOne({
      owner: listing.owner,
      isActive: true,
    });

    if (!bankAccount) {
      console.log(`No active bank account found for owner: ${listing.owner}`);
      return null; // Payout will be created when bank account is added
    }

    // Calculate platform fee (e.g., 10% commission)
    const platformFee = Math.round(payment.amount * 0.1);
    const netAmount = payment.amount - platformFee;

    // Create payout record
    const payout = new Payout({
      owner: listing.owner,
      booking: booking._id,
      payment: payment._id,
      bankAccount: bankAccount._id,
      amount: payment.amount,
      platformFee: platformFee,
      netAmount: netAmount,
      status: "pending",
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Schedule for next day
    });

    await payout.save();
    console.log(
      `Payout created: ${payout.transactionId} for amount: ${netAmount}`
    );

    return payout;
  } catch (error) {
    console.error("Create payout error:", error);
    throw error;
  }
};

// Get user's payouts
export const getUserPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ owner: req.user._id })
      .populate("booking")
      .populate("payment")
      .populate("bankAccount")
      .sort({ createdAt: -1 });

    res.render("payouts/index", { payouts });
  } catch (error) {
    console.error("Get payouts error:", error);
    req.flash("error", "Failed to load payouts");
    res.redirect("/listings");
  }
};

// Show specific payout
export const showPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const payout = await Payout.findById(payoutId)
      .populate("booking")
      .populate("payment")
      .populate("bankAccount")
      .populate({
        path: "booking",
        populate: { path: "listing" },
      });

    if (!payout) {
      req.flash("error", "Payout not found!");
      return res.redirect("/payouts");
    }

    if (!payout.owner.equals(req.user._id)) {
      req.flash("error", "You can only view your own payouts!");
      return res.redirect("/payouts");
    }

    res.render("payouts/show", { payout });
  } catch (error) {
    console.error("Show payout error:", error);
    req.flash("error", "Failed to load payout");
    res.redirect("/payouts");
  }
};

// Process pending payouts (admin function)
export const processPendingPayouts = async (req, res) => {
  try {
    const pendingPayouts = await Payout.find({
      status: "pending",
      scheduledDate: { $lte: new Date() },
    }).populate("bankAccount");

    const results = [];

    for (const payout of pendingPayouts) {
      try {
        // Simulate bank transfer processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update payout status
        payout.status = "completed";
        payout.processedDate = new Date();
        payout.metadata.bankTransactionId =
          "BANK" +
          Date.now() +
          Math.random().toString(36).substr(2, 9).toUpperCase();
        payout.metadata.utrNumber =
          "UTR" +
          Date.now() +
          Math.random().toString(36).substr(2, 9).toUpperCase();

        await payout.save();

        results.push({
          payoutId: payout._id,
          transactionId: payout.transactionId,
          status: "completed",
          bankTransactionId: payout.metadata.bankTransactionId,
        });

        console.log(
          `Payout processed: ${payout.transactionId} - Amount: ${payout.netAmount}`
        );
      } catch (error) {
        payout.status = "failed";
        payout.failureReason = error.message;
        await payout.save();

        results.push({
          payoutId: payout._id,
          transactionId: payout.transactionId,
          status: "failed",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${pendingPayouts.length} payouts`,
      results: results,
    });
  } catch (error) {
    console.error("Process payouts error:", error);
    res.status(500).json({ error: "Failed to process payouts" });
  }
};

// Get payout statistics
export const getPayoutStats = async (req, res) => {
  try {
    const stats = await Payout.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$netAmount" },
        },
      },
    ]);

    const totalPayouts = await Payout.countDocuments({ owner: req.user._id });
    const totalAmount = await Payout.aggregate([
      { $match: { owner: req.user._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$netAmount" } } },
    ]);

    res.json({
      stats: stats,
      totalPayouts: totalPayouts,
      totalAmount: totalAmount[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get payout stats error:", error);
    res.status(500).json({ error: "Failed to get payout statistics" });
  }
};
