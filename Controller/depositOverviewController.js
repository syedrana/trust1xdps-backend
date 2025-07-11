// const User = require("../Model/userModel");
// const Deposit = require("../Model/depositModel");

// const getUserDepositedReport = async (req, res) => {
//   try {
//     const currentMonth = new Date().toLocaleString("default", {
//       month: "long",
//       year: "numeric",
//     });

//     // সব ইউজার
//     const allUsers = await User.find({ isApproved: true });

//     // সব ডিপোজিট (অপ্টিমাইজড)
//     const allDeposits = await Deposit.find({});

//     // এই মাসে যারা ডিপোজিট করেছে তাদের ইউজার আইডি
//     const depositedUserIdsThisMonth = new Set(
//       allDeposits
//         .filter((d) => d.month === currentMonth)
//         .map((d) => d.userId.toString())
//     );

//     // প্রতিটি ইউজারের missingMonths বের করা (মেমোরিতে)
//     const depositsByUser = {}; // { userId: Set([...months]) }

//     allDeposits.forEach((d) => {
//       const userId = d.userId.toString();
//       if (!depositsByUser[userId]) {
//         depositsByUser[userId] = new Set();
//       }
//       depositsByUser[userId].add(d.month);
//     });

//     const depositedUsers = [];
//     const notDepositedUsers = [];

//     allUsers.forEach((user) => {
//       const userId = user._id.toString();

//       if (depositedUserIdsThisMonth.has(userId)) {
//         depositedUsers.push(user);
//       } else {
//         notDepositedUsers.push(user);
//       }
//     });

//     res.status(200).json({
//       currentMonth,
//       totalDeposited: depositedUsers.length,
//       totalNotDeposited: notDepositedUsers.length,
//     });

//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// module.exports = { getUserDepositedReport };




const User = require("../Model/userModel");
const Deposit = require("../Model/depositModel");

const getUserDepositedReport = async (req, res) => {
  try {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // সব ইউজার
    const allUsers = await User.find({ isApproved: true });

    // সব ডিপোজিট (অপ্টিমাইজড)
    const allDeposits = await Deposit.find({}).sort({ createdAt: 1 });

    // প্রথম ডিপোজিটের তারিখ বের করা (userId -> firstDepositDate)
    const firstDepositDates = {};
    allDeposits.forEach((d) => {
      const userId = d.userId.toString();
      if (!firstDepositDates[userId]) {
        firstDepositDates[userId] = new Date(d.createdAt);
      }
    });

    // এই মাসে যারা ডিপোজিট করেছে তাদের ইউজার আইডি
    const depositedUserIdsThisMonth = new Set(
      allDeposits
        .filter((d) => d.month === currentMonth)
        .map((d) => d.userId.toString())
    );

    const depositedUsers = [];
    const notDepositedUsers = [];

    allUsers.forEach((user) => {
      const userId = user._id.toString();

      // যদি ইউজারের প্রথম ডিপোজিট না থাকে তাহলে তারে সরাসরি notDeposited ধরে নাও
      if (!firstDepositDates[userId]) {
        notDepositedUsers.push(user);
      } else if (depositedUserIdsThisMonth.has(userId)) {
        depositedUsers.push(user);
      } else {
        notDepositedUsers.push(user);
      }
    });

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
