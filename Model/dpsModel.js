const mongoose = require("mongoose");

const dpsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    unique: true, // এক ইউজারের একটাই DPS থাকবে
  },
  totalDeposit: {
    type: Number,
    required: [true, "Total deposit is required"],
    min: [0, "Total deposit cannot be negative"],
    default: 0,
  },
  maturityDate: {
    type: Date,
    required: [true, "Maturity date is required"],
  },
  interestMultiplier: {
    type: Number,
    default: 4, // ৪ গুন রিটার্ন
    validate: {
      validator: function (v) {
        return v >= 1;
      },
      message: "Interest multiplier must be at least 1x",
    },
  },
  earlyWithdrawPenalty: {
    type: Number,
    default: 10, // ১০% penalty
    validate: {
      validator: function (v) {
        return v >= 0 && v <= 100;
      },
      message: "Penalty must be between 0 and 100 percent",
    },
  },
  isClosed: {
    type: Boolean,
    default: false, // DPS বন্ধ হলে true হবে
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Pre-save hook to update `updatedAt`
dpsSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("DPS", dpsSchema);
