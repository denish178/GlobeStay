import BankAccount from "../models/bankAccount.js";

// Add bank account for property owner
export const addBankAccount = async (req, res) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      accountType,
    } = req.body.bankAccount;

    // Check if user already has an active bank account
    const existingAccount = await BankAccount.findOne({
      owner: req.user._id,
      isActive: true,
    });

    if (existingAccount) {
      // Deactivate existing account
      existingAccount.isActive = false;
      await existingAccount.save();
    }

    // Create new bank account with explicit isActive: true
    const bankAccount = new BankAccount({
      owner: req.user._id,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName: branchName || "",
      accountType: accountType || "savings",
      isActive: true, // Explicitly set to true
    });

    await bankAccount.save();

    req.flash("success", "Bank account added successfully!");
    res.redirect("/bank-accounts");
  } catch (error) {
    console.error("Add bank account error:", error);
    req.flash("error", "Failed to add bank account: " + error.message);
    res.redirect("/bank-accounts/new");
  }
};

// Show bank account form
export const renderBankAccountForm = (req, res) => {
  res.render("bank-accounts/new");
};

// Show user's bank accounts
export const getUserBankAccounts = async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.render("bank-accounts/index", { bankAccounts });
  } catch (error) {
    console.error("Get bank accounts error:", error);
    req.flash("error", "Failed to load bank accounts");
    res.redirect("/listings");
  }
};

// Show specific bank account
export const showBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const bankAccount = await BankAccount.findById(accountId);

    if (!bankAccount) {
      req.flash("error", "Bank account not found!");
      return res.redirect("/bank-accounts");
    }

    if (!bankAccount.owner.equals(req.user._id)) {
      req.flash("error", "You can only view your own bank accounts!");
      return res.redirect("/bank-accounts");
    }

    res.render("bank-accounts/show", { bankAccount });
  } catch (error) {
    console.error("Show bank account error:", error);
    req.flash("error", "Failed to load bank account");
    res.redirect("/bank-accounts");
  }
};

// Edit bank account form
export const renderEditBankAccountForm = async (req, res) => {
  try {
    const { accountId } = req.params;
    const bankAccount = await BankAccount.findById(accountId);

    if (!bankAccount) {
      req.flash("error", "Bank account not found!");
      return res.redirect("/bank-accounts");
    }

    if (!bankAccount.owner.equals(req.user._id)) {
      req.flash("error", "You can only edit your own bank accounts!");
      return res.redirect("/bank-accounts");
    }

    res.render("bank-accounts/edit", { bankAccount });
  } catch (error) {
    console.error("Edit bank account error:", error);
    req.flash("error", "Failed to load bank account");
    res.redirect("/bank-accounts");
  }
};

// Update bank account
export const updateBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      accountType,
    } = req.body.bankAccount;

    const bankAccount = await BankAccount.findById(accountId);

    if (!bankAccount) {
      req.flash("error", "Bank account not found!");
      return res.redirect("/bank-accounts");
    }

    if (!bankAccount.owner.equals(req.user._id)) {
      req.flash("error", "You can only edit your own bank accounts!");
      return res.redirect("/bank-accounts");
    }

    // Update fields
    bankAccount.accountHolderName = accountHolderName;
    bankAccount.accountNumber = accountNumber;
    bankAccount.ifscCode = ifscCode;
    bankAccount.bankName = bankName;
    bankAccount.branchName = branchName || "";
    bankAccount.accountType = accountType || "savings";
    bankAccount.isVerified = false; // Reset verification when details change

    await bankAccount.save();

    req.flash("success", "Bank account updated successfully!");
    res.redirect(`/bank-accounts/${accountId}`);
  } catch (error) {
    console.error("Update bank account error:", error);
    req.flash("error", "Failed to update bank account: " + error.message);
    res.redirect(`/bank-accounts/${req.params.accountId}/edit`);
  }
};

// Activate bank account (deactivate others)
export const activateBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const bankAccount = await BankAccount.findById(accountId);

    if (!bankAccount) {
      return res.status(404).json({ error: "Bank account not found!" });
    }

    if (!bankAccount.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "You can only activate your own bank accounts!" });
    }

    // Deactivate all other accounts for this user
    await BankAccount.updateMany(
      { owner: req.user._id, _id: { $ne: accountId } },
      { isActive: false }
    );

    // Activate the selected account
    bankAccount.isActive = true;
    await bankAccount.save();

    res.json({ 
      success: true, 
      message: "Bank account activated successfully!" 
    });
  } catch (error) {
    console.error("Activate bank account error:", error);
    res.status(500).json({ error: "Failed to activate bank account" });
  }
};

// Delete bank account
export const deleteBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const bankAccount = await BankAccount.findById(accountId);

    if (!bankAccount) {
      return res.status(404).json({ error: "Bank account not found!" });
    }

    if (!bankAccount.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "You can only delete your own bank accounts!" });
    }

    // Hard delete - remove from database
    await BankAccount.findByIdAndDelete(accountId);

    res.json({ 
      success: true, 
      message: "Bank account deleted successfully!" 
    });
  } catch (error) {
    console.error("Delete bank account error:", error);
    res.status(500).json({ error: "Failed to delete bank account" });
  }
};
