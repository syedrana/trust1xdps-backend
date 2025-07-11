// controllers/getyeatlyDepositController.js
const Deposit = require('../Model/depositModel');

const getYearlyDepositStats = async (req, res) => {
  try {
    const stats = await Deposit.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.year",
          yearlyTotal: { $sum: "$totalAmount" },
          monthlyData: {
            $push: {
              month: "$_id.month",
              amount: "$totalAmount"
            }
          }
        }
      },
      {
        $sort: { _id: -1 } // Latest year first
      }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { getYearlyDepositStats };