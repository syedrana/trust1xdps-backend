const User = require("../Model/userModel");
const Deposit = require("../Model/depositModel");

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

    const allUsers = await User.find({ isApproved: true });
    const allDeposits = await Deposit.find({}).sort({ createdAt: 1 }); // Earliest deposit first

    const totalDepositAmount = allDeposits.reduce((sum, d) => sum + d.amount, 0);

    const depositedUserIdsThisMonth = new Set(
      allDeposits
        .filter((d) => d.month === currentMonth)
        .map((d) => d.userId.toString())
    );

    const depositsByUser = {};
    allDeposits.forEach((d) => {
      const userId = d.userId.toString();
      if (!depositsByUser[userId]) {
        depositsByUser[userId] = new Set();
      }
      depositsByUser[userId].add(d.month);
    });

    const missingMonthsByUser = {};
    const depositedUsers = [];
    const notDepositedUsers = [];

    for (const user of allUsers) {
      const userId = user._id.toString();

      // 🔥 Update: প্রথম ডিপোজিট না থাকলে fallback আজকের তারিখ
      const firstDeposit = allDeposits.find((d) => d.userId.toString() === userId);
      const startDate = firstDeposit ? firstDeposit.createdAt : new Date();

      const months = getMonthList(startDate, new Date());
      const totalMonths = months.length;

      const depositedMonths = depositsByUser[userId] || new Set();
      const missingMonths = months.filter((month) => !depositedMonths.has(month));

      // if (depositedUserIdsThisMonth.has(userId)) {
      //   depositedUsers.push(user);
      // } else {
      //   notDepositedUsers.push(user);
      // }

      if (missingMonths.length === 0) {
        depositedUsers.push(user);
      } else {
        notDepositedUsers.push(user);
      }

      missingMonthsByUser[userId] = {
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
      };
    }

    res.status(200).json({
      currentMonth,
      missingMonthsByUser,
      totalUsers: allUsers.length,
      totalDeposited: depositedUsers.length,
      totalNotDeposited: notDepositedUsers.length,
      totalDepositAmount,
      depositedUsers,
      notDepositedUsers,
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUsersNotDepositedThisMonth };
