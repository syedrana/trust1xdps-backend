const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  amount: {
    type: Number,
    required: [true, "Withdrawal amount is required"],
    min: [1, "Amount must be at least 1"],
  },
  penalty: {
    type: Number,
    default: 0,
    min: [0, "Penalty cannot be negative"],
  },
  matured: {
    type: Boolean,
    required: [true, "Maturity status is required"],
  },
  withdrawMethod: {
    type: String,
    enum: ["bKash", "Nagad", "Rocket", "Bank Transfer", "Binance Pay"],
    required: [true, "Withdraw method is required"]
  },
  accountNumber: {
    type: String,
    required: [true, "Account number is required"],
    trim: true,
    maxlength: [20, "Account number too long"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: [500, "Admin note cannot exceed 500 characters"],
  },
  reviewedBy: {
    type: String,
    default: "",
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

withdrawRequestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);
