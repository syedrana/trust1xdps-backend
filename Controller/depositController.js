const Deposit = require("../Model/depositModel");
const User = require("../Model/userModel");
const DPS = require("../Model/dpsModel"); // ✅ DPS Model import
const mongoose = require("mongoose");

// Helper: Generate unique receipt number
const generateReceiptNo = () => {
  return "RCPT-" + Date.now();
};

// POST /deposit/:userId
const deposit = async (req, res) => {
  const { id } = req.params;
  const { amount, month, note, paymentMethod, transaction } = req.body;

  if (!amount || !month) {
    return res.status(400).json({ message: "Amount and month are required." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: "User not approved." });
    }

    // ✅ Check if deposit for the same month already exists
    const existing = await Deposit.findOne({ userId: id, month });
    if (existing) {
      return res.status(409).json({ message: "Deposit for this month already exists." });
    }

    // ✅ Create new Deposit entry
    const newDeposit = new Deposit({
      userId: id,
      amount: amount,
      month: month,
      paymentMethod: paymentMethod,
      receivedBy: "Admin",
      transaction: transaction,
      status: "Approved",
      receiptNo: generateReceiptNo(),
      note: note || "",
    });

    await newDeposit.save();

    // ✅ Update or Create DPS
    let userDps = await DPS.findOne({ userId: id });
    if (!userDps) {
      // First time DPS creation
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + 36); // ৩৬ মাস পর মেচুরিটি
      userDps = new DPS({
        userId: id,
        totalDeposit: amount,
        maturityDate,
      });
    } else {
      // DPS exists, update totalDeposit
      userDps.totalDeposit += amount;
    }
    await userDps.save();

    res.status(201).json({
      message: "Deposit added successfully",
      deposit: newDeposit,
      dps: userDps,
    });
  } catch (err) {
    console.error("Deposit creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = deposit;
