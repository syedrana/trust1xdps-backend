const Deposit = require("../Model/depositModel");

const totalDeposit = async (req, res) => {
  try {
    const result = await Deposit.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const total = result.length > 0 ? result[0].totalAmount : 0;
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = totalDeposit;
