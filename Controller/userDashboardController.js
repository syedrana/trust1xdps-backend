// const User = require('../Model/userModel');
// const Deposit = require('../Model/depositModel');

// const userDashboardData = async (req, res) => {
//   try {
//     const userId = req.userid; // ✅ middleware থেকে পাওয়া

//     if (!userId) {
//       return res.status(401).json({ message: 'Unauthorized: No user ID' });
//     }

//     // ✅ User ও Deposit একসাথে খুঁজে আনা
//     const [user, deposits] = await Promise.all([
//       User.findById(userId),
//       Deposit.find({ userId }),
//     ]);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     let totalDeposit = 0;
//     let totalProfit = 0;
//     let withdrawableAmount = 0;

//     const now = new Date();

//     for (let deposit of deposits) {
//       const amount = deposit.amount;
//       totalDeposit += amount;

//       const depositDate = new Date(deposit.createdAt);
//       const diffInMonths =
//         (now.getFullYear() - depositDate.getFullYear()) * 12 +
//         (now.getMonth() - depositDate.getMonth());

//       // ✅ ৪ গুণ মুনাফা
//       const profit = amount * 4;
//       totalProfit += profit;

//       // ✅ উত্তলনযোগ্য অংশ নির্ধারণ
//       if (diffInMonths >= 36) {
//         withdrawableAmount += amount + profit;
//       } else {
//         withdrawableAmount += amount * 0.9;
//       }
//     }

//     // ✅ ম্যাচুরিটি তারিখ নির্ণয়
//     const approvedAt = user.approvedAt;
//     let maturityDate = null;
//     let daysLeft = null;

//     if (approvedAt) {
//       maturityDate = new Date(approvedAt);
//       maturityDate.setMonth(maturityDate.getMonth() + 36);

//       const diffTime = maturityDate - now;
//       daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     }

//     // ✅ দুই দশমিক ঘরে রাউন্ড
//     totalDeposit = parseFloat(totalDeposit.toFixed(2));
//     totalProfit = parseFloat(totalProfit.toFixed(2));
//     withdrawableAmount = parseFloat(withdrawableAmount.toFixed(2));

//     res.status(200).json({
//       totalDeposit,
//       totalProfit,
//       withdrawableAmount,
//       totalMonths: deposits.length,
//       approvedAt: approvedAt ? new Date(approvedAt).toISOString() : null,
//       maturityDate: maturityDate ? maturityDate.toISOString() : null,
//       daysLeft,
//       userInfo: {
//         name: `${user.firstName} ${user.lastName}`,
//         photo: user.image,
//         registeredAt: user.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error('Dashboard Data Error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// module.exports = userDashboardData;

















// const User = require('../Model/userModel');
// const DPS = require('../Model/dpsModel');
// const Deposit = require('../Model/depositModel');

// const userDashboardData = async (req, res) => {
//   try {
//     const userId = req.userid;

//     if (!userId) {
//       return res.status(401).json({ message: 'Unauthorized: No user ID' });
//     }

//     // ✅ ইউজার, DPS, Deposit একসাথে লোড
//     const [user, userDps, deposits] = await Promise.all([
//       User.findById(userId),
//       DPS.findOne({ userId }),
//       Deposit.find({ userId }).sort({ createdAt: 1 }),
//     ]);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (!userDps) {
//       return res.status(404).json({ message: 'No DPS account found' });
//     }

//     const now = new Date();

//     // ✅ DPS মডেল থেকে তথ্য
//     const totalDeposit = parseFloat(userDps.totalDeposit.toFixed(2));
//     const maturityDate = userDps.maturityDate;
//     const interestMultiplier = userDps.interestMultiplier || 4;
//     const penaltyPercent = userDps.earlyWithdrawPenalty || 10;
//     const isClosed = userDps.isClosed;

//     const totalProfit = parseFloat((totalDeposit * interestMultiplier).toFixed(2));
//     const maturityAmount = totalDeposit + totalProfit;

//     let withdrawableAmount = 0;
//     let daysLeft = null;

//     if (now >= maturityDate) {
//       withdrawableAmount = maturityAmount;
//     } else {
//       withdrawableAmount = parseFloat((totalDeposit * (1 - penaltyPercent / 100)).toFixed(2));
//       const diffTime = maturityDate - now;
//       daysLeft = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
//     }

//     // ✅ মিসিং মাস বের করা
//     const allMonths = [];
//     const startDate = deposits.length > 0 ? deposits[0].createdAt : userDps.createdAt;
//     const cursor = new Date(startDate);
//     while (
//       cursor.getFullYear() < now.getFullYear() ||
//       (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
//     ) {
//       const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });
//       allMonths.push(monthLabel);
//       cursor.setMonth(cursor.getMonth() + 1);
//     }

//     const depositedMonths = deposits.map((d) => d.month);
//     const missingMonths = allMonths.filter((m) => !depositedMonths.includes(m));

//     // ✅ রেসপন্স
//     res.status(200).json({
//       totalDeposit,
//       totalProfit,
//       maturityAmount,
//       withdrawableAmount,
//       totalMonths: deposits.length,
//       approvedAt: userDps.createdAt,
//       maturityDate,
//       daysLeft,
//       isClosed,
//       interestMultiplier,
//       penaltyPercent,
//       missingMonths,
//       userInfo: {
//         name: `${user.firstName} ${user.lastName || ''}`,
//         photo: user.image,
//         registeredAt: user.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error('Dashboard Data Error:', error.message, error.stack);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// module.exports = userDashboardData;












const User = require('../Model/userModel');
const DPS = require('../Model/dpsModel');
const Deposit = require('../Model/depositModel');

const userDashboardData = async (req, res) => {
  try {
    const userId = req.userid;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID' });
    }

    const [user, userDps, deposits] = await Promise.all([
      User.findById(userId),
      DPS.findOne({ userId }),
      Deposit.find({ userId }).sort({ createdAt: 1 }),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!userDps) {
      return res.status(200).json({
        totalDeposit: 0,
        totalProfit: 0,
        maturityAmount: 0,
        withdrawableAmount: 0,
        totalMonths: 0,
        approvedAt: null,
        maturityDate: null,
        daysLeft: null,
        isClosed: false,
        interestMultiplier: 0,
        penaltyPercent: 0,
        missingMonths: [],
        userInfo: {
          name: `${user.firstName} ${user.lastName || ''}`,
          photo: user.image,
          registeredAt: user.createdAt,
        },
      });
    }

    const now = new Date();

    const totalDeposit = parseFloat(userDps.totalDeposit.toFixed(2));
    const maturityDate = userDps.maturityDate;
    const interestMultiplier = userDps.interestMultiplier || 4;
    const penaltyPercent = userDps.earlyWithdrawPenalty || 10;
    const isClosed = userDps.isClosed;

    const totalProfit = parseFloat((totalDeposit * interestMultiplier).toFixed(2));
    const maturityAmount = totalDeposit + totalProfit;

    let withdrawableAmount = 0;
    let daysLeft = null;

    if (now >= maturityDate) {
      withdrawableAmount = maturityAmount;
    } else {
      withdrawableAmount = parseFloat((totalDeposit * (1 - penaltyPercent / 100)).toFixed(2));
      const diffTime = maturityDate - now;
      daysLeft = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
    }

    const allMonths = [];
    const startDate = deposits.length > 0 ? deposits[0].createdAt : userDps.createdAt;
    const cursor = new Date(startDate);
    while (
      cursor.getFullYear() < now.getFullYear() ||
      (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
    ) {
      const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });
      allMonths.push(monthLabel);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const depositedMonths = deposits.map((d) => d.month);
    const missingMonths = allMonths.filter((m) => !depositedMonths.includes(m));

    res.status(200).json({
      totalDeposit,
      totalProfit,
      maturityAmount,
      withdrawableAmount,
      totalMonths: deposits.length,
      approvedAt: userDps.createdAt,
      maturityDate,
      daysLeft,
      isClosed,
      interestMultiplier,
      penaltyPercent,
      missingMonths,
      userInfo: {
        name: `${user.firstName} ${user.lastName || ''}`,
        photo: user.image,
        registeredAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Dashboard Data Error:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = userDashboardData;





