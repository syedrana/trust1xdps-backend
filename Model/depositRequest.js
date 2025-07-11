const mongoose = require("mongoose");

const depositRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },

  requestDate: {
    type: Date,
    default: Date.now,
  },

  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [1, "Amount must be at least 1"],
  },

  selectedMethod: {
    type: String,
    required: [true, "Selected method is required"],
    enum: {
      values: [
        "bKash 01304245543 (Personal)",
        "Nagad 01304245543 (Personal)",
        "Rocket 01304245543 (Personal)",
        "DBBL 7017310724806 (Nur Alam)",
        "Binance pay 897928088",
      ],
      message: "Invalid payment method",
    },
  },

  transaction: {
    type: String,
    required: [true, "Transaction ID is required"],
    trim: true,
  },

  status: {
    type: String,
    enum: {
      values: ["pending", "approved", "rejected"],
      message: "Invalid status value",
    },
    default: "pending",
  },

  note: {
    type: String,
    maxlength: [300, "Note can be maximum 300 characters"],
    trim: true,
  },
  
  month: {
    type: String,
    required: [true, "Deposit month is required"],
  },

  reviewedBy: {
    type: String,
    trim: true,
  },

  reviewedAt: Date,

  rejectNote: {
    type: String,
    default: "",
  },

  receiptNo: {
    type: String,
    default: "",
  },



}, { timestamps: true });

module.exports = mongoose.model("DepositRequest", depositRequestSchema);
