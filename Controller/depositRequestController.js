const DepositRequest = require("../Model/depositRequest");
const Deposit = require("../Model/depositModel");
const User = require("../Model/userModel");
const DPS = require("../Model/dpsModel");

// 1️⃣ ইউজার ডিপোজিট রিকোয়েস্ট পাঠাবে
const createDepositRequest = async (req, res) => {
  try {
    const { amount, transaction, note, selectedMethod, month } = req.body;
    
    const userId = req.userid;

    const newRequest = await DepositRequest.create({
      userId: userId,
      amount: amount,
      selectedMethod: selectedMethod,
      transaction: transaction,
      note: note,
      month: month,
    });

    res.status(201).json({ message: "Deposit request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("Create Deposit Request Error:", error);
    res.status(500).json({ error: "Failed to create deposit request" });
  }
};

// ✅ ইউটিলিটি ফাংশন: দুটি তারিখের মধ্যে সব মাসের নামের লিস্ট তৈরি করে
function getMonthList(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const list = [];

  while (startDate <= endDate) {
    const label = startDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    list.push(label);
    startDate.setMonth(startDate.getMonth() + 1);
  }

  return list;
}

// ✅ লগইন ইউজারের missing মাস বের করা
const getMyMissingDepositMonths = async (req, res) => {
  try {
    const userId = req.userid;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const allDeposits = await Deposit.find({ userId }).sort({ createdAt: 1 });

    // 🔥 প্রথম ডিপোজিট থেকে startDate ধরবে, না থাকলে fallback আজকের তারিখ
    const firstDeposit = allDeposits[0];
    const startDate = firstDeposit ? firstDeposit.createdAt : new Date();

    const now = new Date();

    // ✅ getMonthList utility ফাংশন দিয়ে সব মাস বের করো
    const allMonths = getMonthList(startDate, now);
    const depositedMonths = new Set(allDeposits.map(d => d.month));
    const missingMonths = allMonths.filter(m => !depositedMonths.has(m));

    res.status(200).json({ missingMonths });
  } catch (error) {
    console.error("Missing months fetch error:", error);
    res.status(500).json({ error: "Failed to fetch missing months" });
  }
};


// ✅ ইউজার সব রিকোয়েস্ট দেখবে
const getMyDepositRequests = async (req, res) => {
  try {
    const userId = req.userid;

    const requests = await DepositRequest.find({ userId })
      .sort({ createdAt: -1 }) // latest first
      .populate({
        path: "userId",
        select: "firstName lastName email mobile" // শুধু এই ফিল্ডগুলো আনবে
      });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching user deposit requests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 2️⃣ অ্যাডমিন সব রিকোয়েস্ট দেখবে
const getAllDepositRequests = async (req, res) => {
  try {
    const requests = await DepositRequest.find()
      .populate("userId", "firstName lastName email mobile image")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Fetch Deposit Requests Error:", error);
    res.status(500).json({ error: "Failed to fetch deposit requests" });
  }
};

// 3️⃣ অ্যাডমিন রিকোয়েস্ট অ্যাপ্রুভ বা রিজেক্ট করবে
const approveOrRejectDepositRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectNote } = req.body;
    const adminName = req.user?.name || "Admin";

    // Helper: Generate unique receipt number
    const generateReceiptNo = () => {
      return 'RCPT-' + Date.now();
    };

    const request = await DepositRequest.findById(id).populate("userId");
    if (!request) {
      return res.status(404).json({ error: "Deposit request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    if (status.toLowerCase() === "approved") {

      const receiptNo = generateReceiptNo();

      // ✅ Add to Deposit Model
      await Deposit.create({
        userId: request.userId._id,
        amount: request.amount,
        month: request.month,
        paymentMethod: request.selectedMethod,
        receivedBy: adminName,
        transaction: request.transaction,
        status: "Approved",
        receiptNo: receiptNo,
        note: request.note || "",
      });

      // ✅ Update or Create DPS Model
      let userDps = await DPS.findOne({ userId: request.userId._id });
      if (!userDps) {
        // First DPS creation
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + 36); // ৩৬ মাস পর মেচুরিটি

        userDps = new DPS({
          userId: request.userId._id,
          totalDeposit: request.amount,
          maturityDate: maturityDate,
          interestMultiplier: 4, // ৪ গুণ মুনাফা
        });
      } else {
        // Update existing DPS
        userDps.totalDeposit += request.amount;
      }
      await userDps.save();

      // ✅ Update Request status
      request.status = "approved";
      request.reviewedBy = adminName;
      request.reviewedAt = new Date();
      request.receiptNo = receiptNo;

    } else if (status.toLowerCase() === "rejected") {
      request.status = "rejected";
      request.reviewedBy = adminName;
      request.reviewedAt = new Date();
      request.rejectNote = rejectNote || "";
    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    await request.save();

    res.status(200).json({ message: `Deposit request ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error("Approve/Reject Deposit Error:", error);
    res.status(500).json({ error: "Failed to process deposit request" });
  }
};



module.exports = {
  createDepositRequest,
  getAllDepositRequests,
  approveOrRejectDepositRequest,
  getMyMissingDepositMonths,
  getMyDepositRequests,
};
