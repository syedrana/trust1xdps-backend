const WithdrawRequest = require("../Model/withdrawModel");
const DPS = require("../Model/dpsModel");
const User = require("../Model/userModel");

const closedDpsWithdrawReport = async (req, res) => {
  try {
    const report = await DPS.aggregate([
      {
        $match: { isClosed: true }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $lookup: {
          from: "withdrawrequests",
          localField: "userId",
          foreignField: "userId",
          as: "withdrawInfo"
        }
      },
      {
        $addFields: {
          totalWithdrawAmount: { $sum: "$withdrawInfo.amount" },
          totalPenalty: { $sum: "$withdrawInfo.penalty" },
          withdrawCount: { $size: "$withdrawInfo" },
        }
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          "userInfo.firstName": 1,
          "userInfo.lastName": 1,
          "userInfo.mobile": 1,
          "userInfo.email": 1,
          "userInfo.image": 1,
          totalDeposit: 1,
          maturityDate: 1,
          totalWithdrawAmount: 1,
          totalPenalty: 1,
          withdrawCount: 1,
          withdrawDetails: "$withdrawInfo"
        }
      },
      { $sort: { totalWithdrawAmount: -1 } }
    ]);

    res.status(200).json(report);
  } catch (error) {
    console.error("Error in closedDpsWithdrawReport:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = closedDpsWithdrawReport;
