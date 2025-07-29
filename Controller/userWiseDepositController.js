const Deposit = require("../Model/depositModel");
const DPS = require("../Model/dpsModel");
const User = require("../Model/userModel");


const userWiseDeposit = async (req, res) => {
  try {
    const deposits = await Deposit.aggregate([
      // Join with DPS to check if isClosed = false
      {
        $lookup: {
          from: "dps",
          localField: "userId",
          foreignField: "userId",
          as: "dpsInfo"
        }
      },
      {
        $unwind: "$dpsInfo"
      },
      {
        $match: {
          "dpsInfo.isClosed": false
        }
      },

      // Join with User info
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },

      // Add all month strings (e.g., "May 2025") to a set to avoid duplicates
      {
        $group: {
          _id: "$userId",
          firstname: { $first: "$userInfo.firstName" },
          lastname: { $first: "$userInfo.lastName" },
          mobile: { $first: "$userInfo.mobile" },
          email: { $first: "$userInfo.email" },
          address: { $first: "$userInfo.address" },
          image: { $first: "$userInfo.image" },
          totalDeposit: { $sum: "$amount" },
          uniqueMonths: { $addToSet: "$month" }
        }
      },

      // Count how many unique months they deposited in
      {
        $addFields: {
          totalMonths: { $size: "$uniqueMonths" }
        }
      },

      { $sort: { totalDeposit: -1 } }
    ]);

    res.status(200).json(deposits);
  } catch (error) {
    console.error("Error in userWiseDeposit:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = userWiseDeposit;