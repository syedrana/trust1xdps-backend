//controllers/getMonthlyDepositController.js
const Deposit = require('../Model/depositModel');

const getMonthlyDepositStats = async (req, res) => {
  try {
    const deposits = await Deposit.aggregate([
      {
        $group: {
          _id: "$month", // Example: "May 2025"
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deposit stats", error });
  }
};

module.exports = { getMonthlyDepositStats };
