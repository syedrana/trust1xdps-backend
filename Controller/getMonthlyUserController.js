// controllers/getMonthlyUserController.js
const User = require('../Model/userModel');

const getMonthlyUserStats = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user stats", error });
  }
};

module.exports = { getMonthlyUserStats };
