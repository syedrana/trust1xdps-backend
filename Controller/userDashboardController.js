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
        maturityAmount: 0,
        withdrawableAmount: 0,
        totalMonths: 0,
        approvedAt: null,
        startMaturityAt: null,
        maturityDate: null,
        daysLeft: null,
        isClosed: false,
        interestMultiplier: 0,
        penaltyPercent: 0,
        depositedMonths: [],
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
    const maturityAmount = totalProfit;
    const totalPenalty = parseFloat((totalDeposit * penaltyPercent / 100).toFixed(2));


    let withdrawableAmount = 0;
    let daysLeft = null;

    if (!maturityDate) {
      withdrawableAmount = 0;
      daysLeft = null;
    } else if (now >= maturityDate) {
      withdrawableAmount = totalProfit;
    } else {
      withdrawableAmount = totalDeposit - totalPenalty;
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
      maturityAmount,
      withdrawableAmount,
      totalPenalty,
      totalMonths: deposits.length,
      approvedAt: user.createdAt,
      startMaturityAt: startDate,
      maturityDate,
      daysLeft,
      isClosed,
      interestMultiplier,
      penaltyPercent,
      depositedMonths,
      missingMonths,
      userInfo: {
        name: `${user.firstName} ${user.lastName || ''}`,
        photo: user.image?.secure_url || user.image,
        registeredAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Dashboard Data Error:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = userDashboardData;





