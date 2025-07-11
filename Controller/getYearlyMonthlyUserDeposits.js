const Deposit = require('../Model/depositModel');
const User = require('../Model/userModel');
const moment = require('moment');

const getYearlyMonthlyUserDeposits = async (req, res) => {
  try {
    // ✅ Get all approved users with approvedAt field
    const allUsers = await User.find(
      { isApproved: true },
      'firstName lastName image email mobile address approvedAt'
    ).lean();

    const deposits = await Deposit.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          year: { $toInt: { $arrayElemAt: [{ $split: ['$month', ' '] }, 1] } },
          monthName: { $arrayElemAt: [{ $split: ['$month', ' '] }, 0] },
          address: { $ifNull: ['$user.address', ''] },
          monthIndex: {
            $indexOfArray: [
              ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              { $arrayElemAt: [{ $split: ['$month', ' '] }, 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$monthName',
            monthIndex: '$monthIndex',
            userId: '$userId'
          },
          amount: { $sum: '$amount' },
          firstname: { $first: '$user.firstName' },
          lastname: { $first: '$user.lastName' },
          image: { $first: '$user.image' },
          email: { $first: '$user.email' },
          mobile: { $first: '$user.mobile' },
          address: { $first: '$address' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            monthIndex: '$_id.monthIndex'
          },
          users: {
            $push: {
              userId: '$_id.userId',
              firstname: '$firstname',
              lastname: '$lastname',
              image: '$image',
              email: '$email',
              mobile: '$mobile',
              address: '$address',
              amount: '$amount'
            }
          },
          monthlyTotal: { $sum: '$amount' },
          userCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.year',
          months: {
            $push: {
              month: '$_id.month',
              monthIndex: '$_id.monthIndex',
              totalAmount: '$monthlyTotal',
              userCount: '$userCount',
              users: '$users'
            }
          },
          totalAmount: { $sum: '$monthlyTotal' }
        }
      },
      { $sort: { _id: -1 } },
      {
        $addFields: {
          months: {
            $sortArray: {
              input: '$months',
              sortBy: { monthIndex: 1 }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          totalAmount: 1,
          months: 1
        }
      }
    ]);

    // ✅ Enhance with approvedAt-based notDeposited logic
    for (const yearObj of deposits) {
      const year = yearObj.year;

      for (const month of yearObj.months) {
        const monthIndex = month.monthIndex;

        const endOfMonth = moment()
          .year(year)
          .month(monthIndex)
          .endOf('month')
          .toDate();

        const approvedUsersTillMonth = allUsers.filter(user => {
          return new Date(user.approvedAt) <= endOfMonth;
        });

        const depositedIds = month.users.map(u => u.userId.toString());

        const notDeposited = approvedUsersTillMonth.filter(u => !depositedIds.includes(u._id.toString()));

        month.totalUsersInSystem = approvedUsersTillMonth.length;
        month.notDepositedUserCount = notDeposited.length;
        month.notDepositedUsers = notDeposited.map(u => ({
          userId: u._id,
          firstname: u.firstName,
          lastname: u.lastName,
          image: u.image,
          email: u.email,
          mobile: u.mobile,
          address: u.address
        }));
      }

      const endOfYear = moment().year(year).endOf('year').toDate();
      const approvedInYear = allUsers.filter(u => new Date(u.approvedAt) <= endOfYear);
      yearObj.totalUsersInYear = approvedInYear.length;
    }

    res.status(200).json(deposits);
  } catch (error) {
    console.error('Error fetching yearly/monthly/user deposits:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = { getYearlyMonthlyUserDeposits };
