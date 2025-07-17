// const User = require("../Model/userModel");
// const Deposit = require("../Model/depositModel");

// // ইউটিলিটি ফাংশন: দুটি তারিখের মধ্যে সব মাসের নামের লিস্ট তৈরি করে
// function getMonthList(start, end) {
//   const startDate = new Date(start);
//   const endDate = new Date(end);
//   const list = [];

//   while (startDate <= endDate) {
//     const label = startDate.toLocaleString("default", {
//       month: "long",
//       year: "numeric",
//     });
//     list.push(label);
//     startDate.setMonth(startDate.getMonth() + 1);
//   }

//   return list;
// }

// // মূল রিপোর্ট ফাংশন: কারা এই মাসে ডিপোজিট করেনি, কারা করেছে, কতো করেছে ইত্যাদি
// const getUsersNotDepositedThisMonth = async (req, res) => {
//   try {
//     // এই মাসের নাম নির্ধারণ (e.g. "June 2025")
//     const currentMonth = new Date().toLocaleString("default", {
//       month: "long",
//       year: "numeric",
//     });

//     // সব approved ইউজার ও সব ডিপোজিট খুঁজে বের করো
//     const allUsers = await User.find({ isApproved: true });
//     const allDeposits = await Deposit.find({});

//     // মোট ডিপোজিট এমাউন্ট গণনা
//     const totalDepositAmount = allDeposits.reduce((sum, d) => sum + d.amount, 0);

//     // এই মাসে যারা ডিপোজিট করেছে তাদের userId গুলো সংগ্রহ করো (Set এর মাধ্যমে faster lookup)
//     const depositedUserIdsThisMonth = new Set(
//       allDeposits
//         .filter((d) => d.month === currentMonth)
//         .map((d) => d.userId.toString())
//     );

//     // প্রতি ইউজারের ডিপোজিট করা মাসগুলো আলাদা করে সংরক্ষণ
//     const depositsByUser = {};
//     allDeposits.forEach((d) => {
//       const userId = d.userId.toString();
//       if (!depositsByUser[userId]) {
//         depositsByUser[userId] = new Set();
//       }
//       depositsByUser[userId].add(d.month);
//     });

//     // রিপোর্টের জন্য আলাদা অবজেক্ট ও তালিকা
//     const missingMonthsByUser = {};
//     const depositedUsers = [];
//     const notDepositedUsers = [];

//     // প্রতিটি ইউজার নিয়ে কাজ করো
//     for (const user of allUsers) {
//       const userId = user._id.toString();

//       // ইউজারের approvedAt বা createdAt থেকে মাসের তালিকা তৈরি করো
//       const startDate = user.approvedAt;
//       const months = getMonthList(startDate, new Date());
//       const totalMonths = months.length;

//       // ইউজারের ডিপোজিট করা মাসের তুলনায় কোন কোন মাস বাদ গেছে বের করো
//       const depositedMonths = depositsByUser[userId] || new Set();
//       const missingMonths = months.filter((month) => !depositedMonths.has(month));

//       // এই মাসে ডিপোজিট না করা ইউজার আলাদা করো
//       if (depositedUserIdsThisMonth.has(userId)) {
//         depositedUsers.push(user);
//       } else {
//         notDepositedUsers.push(user);
//       }

//       // রিপোর্টের জন্য ইউজারভিত্তিক ডেটা তৈরি
//       missingMonthsByUser[userId] = {
//         id: user._id,
//         name: `${user.firstName} ${user.lastName || ''}`, // 🔧 নামের ভুল ঠিক করা হয়েছে
//         email: user.email,
//         mobile: user.mobile,
//         address: user.address,
//         image: user.image,
//         approvedAt: startDate,
//         depositedMonths: Array.from(depositedMonths),
//         missingMonths,
//         totalMonths,
//         totalDeposited: allDeposits
//           .filter((d) => d.userId.toString() === userId)
//           .reduce((sum, d) => sum + d.amount, 0),
//       };
//     }

//     // 📤 ফাইনাল রিপোর্ট পাঠানো
//     res.status(200).json({
//       currentMonth,
//       missingMonthsByUser,
//       totalUsers: allUsers.length,
//       totalDeposited: depositedUsers.length,
//       totalNotDeposited: notDepositedUsers.length,
//       totalDepositAmount,
//       depositedUsers,
//       notDepositedUsers,
//     });

//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// module.exports = { getUsersNotDepositedThisMonth };





// const User = require("../Model/userModel");
// const Deposit = require("../Model/depositModel");

// // ইউটিলিটি ফাংশন: দুটি তারিখের মধ্যে সব মাসের নামের লিস্ট তৈরি করে
// function getMonthList(start, end) {
//   const startDate = new Date(start);
//   const endDate = new Date(end);
//   const list = [];

//   while (startDate <= endDate) {
//     const label = startDate.toLocaleString("default", {
//       month: "long",
//       year: "numeric",
//     });
//     list.push(label);
//     startDate.setMonth(startDate.getMonth() + 1);
//   }

//   return list;
// }

// // মূল রিপোর্ট ফাংশন
// const getUsersNotDepositedThisMonth = async (req, res) => {
//   try {
//     const currentMonth = new Date().toLocaleString("default", {
//       month: "long",
//       year: "numeric",
//     });

//     const allUsers = await User.find({ isApproved: true });
//     const allDeposits = await Deposit.find({}).sort({ createdAt: 1 }); // 🔥 Add sort for earliest deposit

//     const totalDepositAmount = allDeposits.reduce((sum, d) => sum + d.amount, 0);

//     const depositedUserIdsThisMonth = new Set(
//       allDeposits
//         .filter((d) => d.month === currentMonth)
//         .map((d) => d.userId.toString())
//     );

//     const depositsByUser = {};
//     allDeposits.forEach((d) => {
//       const userId = d.userId.toString();
//       if (!depositsByUser[userId]) {
//         depositsByUser[userId] = new Set();
//       }
//       depositsByUser[userId].add(d.month);
//     });

//     const missingMonthsByUser = {};
//     const depositedUsers = [];
//     const notDepositedUsers = [];

//     for (const user of allUsers) {
//       const userId = user._id.toString();

//       // 🔥 Update: প্রথম ডিপোজিটের তারিখ বের করো
//       const firstDeposit = allDeposits.find((d) => d.userId.toString() === userId);
//       const startDate = firstDeposit ? firstDeposit.createdAt : user.approvedAt; // ✅ fallback approvedAt if no deposit

//       const months = getMonthList(startDate, new Date());
//       const totalMonths = months.length;

//       const depositedMonths = depositsByUser[userId] || new Set();
//       const missingMonths = months.filter((month) => !depositedMonths.has(month));

//       if (depositedUserIdsThisMonth.has(userId)) {
//         depositedUsers.push(user);
//       } else {
//         notDepositedUsers.push(user);
//       }

//       missingMonthsByUser[userId] = {
//         id: user._id,
//         name: `${user.firstName} ${user.lastName || ''}`,
//         email: user.email,
//         mobile: user.mobile,
//         address: user.address,
//         image: user.image,
//         approvedAt: startDate, // ✅ এখানে এখন প্রথম ডিপোজিটের তারিখ
//         depositedMonths: Array.from(depositedMonths),
//         missingMonths,
//         totalMonths,
//         totalDeposited: allDeposits
//           .filter((d) => d.userId.toString() === userId)
//           .reduce((sum, d) => sum + d.amount, 0),
//       };
//     }

//     res.status(200).json({
//       currentMonth,
//       missingMonthsByUser,
//       totalUsers: allUsers.length,
//       totalDeposited: depositedUsers.length,
//       totalNotDeposited: notDepositedUsers.length,
//       totalDepositAmount,
//       depositedUsers,
//       notDepositedUsers,
//     });

//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// module.exports = { getUsersNotDepositedThisMonth };











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

      if (depositedUserIdsThisMonth.has(userId)) {
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
