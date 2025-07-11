const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, "Please add the amount"]
  },
  month: {
    type: String, // Example: "May 2025"
    required: [true, "Please add the month"]
  },
  paymentMethod: {
    type: String,
    default: 'Bkash' // Or Nagad, Rocket, Bank etc.
  },
  receivedBy: {
    type: String,
    default: 'Admin' // Or Admin name
  },
  transaction: {
    type: String,
    required: [true, "Please add the transtion code"]
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Reject'],
    default: 'Approved'
  },
  receiptNo: {
    type: String,
    required: true,
    unique: true
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deposit', depositSchema);
