const User = require("../Model/userModel");
const Deposit = require("../Model/depositModel");
const DPS = require("../Model/dpsModel");

// 🔧 utility: মাস লিস্ট তৈরি
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

const getUserDepositedReport = async (req, res) => {
  try {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // 🧑‍💼 ইউজারদের খুঁজে বের করো: এপ্রুভড + DPS নাই বা DPS আছে এবং বন্ধ না
    const allUsers = await User.find({ isApproved: true }).populate("dps").lean();

    const activeUsers = allUsers.filter(user => {
      return !user.dps || user.dps.isClosed === false;
    });

    const allDeposits = await Deposit.find({}).sort({ createdAt: 1 });

    // 🔁 ইউজারভিত্তিক ডিপোজিট map
    const depositsByUser = {};
    for (const d of allDeposits) {
      const userId = d.userId.toString();
      if (!depositsByUser[userId]) {
        depositsByUser[userId] = [];
      }
      depositsByUser[userId].push(d.month);
    }

    const depositedUsers = [];
    const notDepositedUsers = [];

    for (const user of activeUsers) {
      const userId = user._id.toString();

      // প্রথম ডিপোজিট থেকে মাস বের করো
      const userDeposits = allDeposits.filter(d => d.userId.toString() === userId);
      const firstDeposit = userDeposits[0];
      const startDate = firstDeposit ? firstDeposit.createdAt : null;

      if (!startDate) {
        // ডিপোজিটই নাই
        notDepositedUsers.push(user);
        continue;
      }

      const expectedMonths = getMonthList(startDate, new Date());
      const depositedMonths = new Set(depositsByUser[userId] || []);
      const missingMonths = expectedMonths.filter(month => !depositedMonths.has(month));

      if (missingMonths.length === 0) {
        depositedUsers.push(user);
      } else {
        notDepositedUsers.push(user);
      }
    }

    res.status(200).json({
      currentMonth,
      totalDeposited: depositedUsers.length,
      totalNotDeposited: notDepositedUsers.length,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUserDepositedReport };
