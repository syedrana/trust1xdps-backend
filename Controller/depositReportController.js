const User = require("../Model/userModel");
const Deposit = require("../Model/depositModel");
const DPS = require("../Model/dpsModel");

// ইউটিলিটি ফাংশন: দুটি তারিখের মধ্যে সব মাসের নামের লিস্ট তৈরি করে
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

// মূল রিপোর্ট ফাংশন
const getUsersNotDepositedThisMonth = async (req, res) => {
  try {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    const allUsers = await User.find({ isApproved: true })
      .populate("dps")
      .lean();

    const allActiveUsers = allUsers.filter(user => {
      return !user.dps || user.dps.isClosed === false;
    });
    
    const allDeposits = await Deposit.find({}).sort({ createdAt: 1 }); // Earliest deposit first

    const allActiveDps = await DPS.find({ isClosed: false }).populate("userId");

    const totalDepositAmount = allActiveDps
      .filter(dps => dps.userId?.isApproved) // শুধু যাদের অ্যাকাউন্ট এপ্রুভড
      .reduce((sum, dps) => sum + dps.totalDeposit, 0);


    const depositsByUser = {};
    allDeposits.forEach((d) => {
      const userId = d.userId.toString();
      if (!depositsByUser[userId]) {
        depositsByUser[userId] = new Set();
      }
      depositsByUser[userId].add(d.month);
    });

    const totalActiveUser = {};
    const missingMonthsByUser = {};
    const notmissingMonthsByUser = {};
    const depositedUsers = [];
    const notDepositedUsers = [];

    for (const user of allActiveUsers) {
      const userId = user._id.toString();

      // 🔥 Update: প্রথম ডিপোজিট না থাকলে fallback আজকের তারিখ
      const firstDeposit = allDeposits.find((d) => d.userId.toString() === userId);
      const startDate = firstDeposit ? firstDeposit.createdAt : new Date();

      const months = getMonthList(startDate, new Date());
      const totalMonths = months.length;

      const depositedMonths = depositsByUser[userId] || new Set();
      const missingMonths = months.filter((month) => !depositedMonths.has(month));

      const userInfo = {
        id: user._id,
        name: `${user.firstName} ${user.lastName || ''}`,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        image: user.image,
        approvedAt: user.approvedAt,
        startDate, // ✅ রিপোর্টে শুরু তারিখও দেখাতে পারো চাইলে
        depositedMonths: Array.from(depositedMonths),
        missingMonths,
        totalMonths,
        totalDeposited: allDeposits
          .filter((d) => d.userId.toString() === userId)
          .reduce((sum, d) => sum + d.amount, 0),     
      }

      totalActiveUser[userId] = userInfo;

      if (missingMonths.length === 0) {
        depositedUsers.push(user);
        notmissingMonthsByUser[userId] = userInfo;
      } else {
        notDepositedUsers.push(user);
        missingMonthsByUser[userId] = userInfo;
      }
    }

    res.status(200).json({
      currentMonth,
      totalActiveUser,
      notmissingMonthsByUser,
      missingMonthsByUser,
      totalUsers: allActiveUsers.length,
      totalDeposited: depositedUsers.length,
      totalNotDeposited: notDepositedUsers.length,
      totalDepositAmount,
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUsersNotDepositedThisMonth };
