const DPS = require('../Model/dpsModel');
const WithdrawRequest = require('../Model/withdrawModel');

/**
 * 🔥 User: Request Withdrawal
 */
const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.userid;
    const { withdrawMethod, accountNumber } = req.body;

    if (!withdrawMethod || !accountNumber) {
      return res.status(400).json({ message: "Withdraw method and account number required." });
    }

    // ✅ Check active DPS
    const dps = await DPS.findOne({ userId });
    if (!dps || dps.isClosed) {
      return res.status(400).json({ message: "No active DPS found for withdrawal." });
    }

    const now = new Date();
    const matured = now >= dps.maturityDate;

    let withdrawableAmount = 0;
    let penaltyAmount = 0;

    if (matured) {
      withdrawableAmount = dps.totalDeposit * dps.interestMultiplier;
    } else {
      penaltyAmount = (dps.totalDeposit * dps.earlyWithdrawPenalty) / 100;
      withdrawableAmount = dps.totalDeposit - penaltyAmount;
    }

    withdrawableAmount = parseFloat(withdrawableAmount.toFixed(2));
    penaltyAmount = parseFloat(penaltyAmount.toFixed(2));

    //  ✅ Prevent duplicate pending request
    const existingRequest = await WithdrawRequest.findOne({ userId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending withdrawal request." });
    }

    const newRequest = new WithdrawRequest({
      userId,
      amount: withdrawableAmount,
      penalty: penaltyAmount,
      matured,
      withdrawMethod,
      accountNumber
    });

    await newRequest.save();

    res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Withdraw Request Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * 🔥 User: Get My Latest Withdrawal Request
 */
const getMyWithdrawal = async (req, res) => {
  try {
    const userId = req.userid;

    // লেটেস্ট withdrawal রিকোয়েস্ট বের করো
    const latestRequest = await WithdrawRequest.findOne({ userId })
      .sort({ createdAt: -1 });

    // ইউজারের DPS খুঁজে আনো
    const dps = await DPS.findOne({ userId });

    if (!dps || dps.isClosed) {
      return res.status(200).json({
        withdrawRequest: latestRequest || null,
        dpsInfo: null,
      });
    }

    const now = new Date();
    const matured = now >= dps.maturityDate;

    let withdrawableAmount = 0;
    let totalProfit = 0;

    if (matured) {
      totalProfit = dps.totalDeposit * dps.interestMultiplier;
      withdrawableAmount = totalProfit;
    } else {
      const penaltyAmount = (dps.totalDeposit * dps.earlyWithdrawPenalty) / 100;
      withdrawableAmount = dps.totalDeposit - penaltyAmount;
    }

    res.status(200).json({
      withdrawRequest: latestRequest || null,
      dpsInfo: {
        totalDeposit: dps.totalDeposit,
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        withdrawableAmount: parseFloat(withdrawableAmount.toFixed(2)),
        matured,
      },
    });
  } catch (error) {
    console.error("Get My Withdrawal Request Error:", error.message);
    res.status(500).json({ message: "Server error while fetching withdrawal request." });
  }
};



/**
 * 🔥 Admin: Get All Withdraw Requests
 */
const getAllWithdrawal = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find()
      .populate('userId', 'firstName lastName email mobile') // ইউজারের নাম ইমেইল দেখাবে
      .sort({ createdAt: -1 }); // লেটেস্ট আগে

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get Withdraw Requests Error:", error.message);
    res.status(500).json({ message: "Server error while fetching withdraw requests." });
  }
};

/**
 * 🔥 Admin: Approve or Reject Withdrawal
 */
const processWithdrawal = async (req, res) => {
  try {
    const { requestId, action, adminNote } = req.body; // action = approve | reject
    //const adminId = req.adminid; // ✅ Admin Auth Middleware থেকে

    // ✅ Validate action
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." });
    }

    // ✅ Find withdrawal request
    const request = await WithdrawRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: "Withdrawal request not found or already processed." });
    }

    if (action === "approve") {
      // ✅ Close DPS
      const dps = await DPS.findOne({ userId: request.userId });
      if (dps && !dps.isClosed) {
        dps.isClosed = true;
        await dps.save();
      }

      request.status = "approved";
    } else {
      request.status = "rejected";
    }

    request.reviewedBy = "admin";
    request.reviewedAt = new Date();
    request.adminNote = adminNote;
    await request.save();

    res.status(200).json({
      message: `Withdrawal ${action}ed successfully.`,
      request,
    });
  } catch (error) {
    console.error("Process Withdrawal Error:", error.message);
    res.status(500).json({ message: "Server error while processing withdrawal." });
  }
};

/**
 * 🔥 Get Total Withdrawal amount
 */
const getTotalWithdrawAmount = async (req, res) => {
  try {
    const result = await WithdrawRequest.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          totalWithdrawAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.status(200).json({
      totalWithdrawAmount: result[0]?.totalWithdrawAmount || 0
    });
  } catch (error) {
    console.error("Withdraw amount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔥 Get Total Penalty amount
 */
const getTotalPenalty = async (req, res) => {
  try {
    const result = await WithdrawRequest.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          totalPenalty: { $sum: "$penalty" }
        }
      }
    ]);

    res.status(200).json({
      totalPenalty: result[0]?.totalPenalty || 0
    });
  } catch (error) {
    console.error("Penalty error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔥 Get Total Deposit without withdraw
 */
const getTotalActiveDeposit = async (req, res) => {
  try {
    // শুধু যেগুলো এখনো বন্ধ হয়নি (isClosed: false)
    const result = await DPS.aggregate([
      {
        $match: { isClosed: false }
      },
      {
        $group: {
          _id: null,
          totalActiveDeposit: { $sum: "$totalDeposit" },
          dpsCount: { $sum: 1 }
        }
      }
    ]);

    const data = result[0] || {
      totalActiveDeposit: 0,
      dpsCount: 0
    };

    res.status(200).json(data);
  } catch (error) {
    console.error("Active DPS deposit calculation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawal,
  getAllWithdrawal,
  processWithdrawal,
  getTotalWithdrawAmount,
  getTotalPenalty,
  getTotalActiveDeposit,
};
