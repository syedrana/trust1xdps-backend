const User = require("../Model/userModel");
const DPS = require("../Model/dpsModel");
const Deposit = require("../Model/depositModel");
const WithdrawRequest = require("../Model/withdrawModel");

const getWithdrawnUserFullDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // একক ইউজার খুঁজে বের করো
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ইউজারের ডিপিএস খুঁজো
    const dps = await DPS.findOne({ userId: user._id });
    if (!dps || !dps.isClosed) {
      return res.status(404).json({ message: "Closed DPS not found for this user" });
    }

    // ডিপোজিট ও উইথড্র খুঁজো
    const deposits = await Deposit.find({ userId: user._id });
    const withdrawals = await WithdrawRequest.find({ userId: user._id });


    // পূর্ণ রিপোর্ট
    const result = {
      user: {
        id: user._id,
        fullName: user.firstName + " " + user.lastName,
        email: user.email,
        mobile: user.mobile,
        nid: user.nid,
        address: user.address,
        image: user.image,
        nominee: {
          name: user.nomineeName,
          relation: user.nomineeRelation,
          mobile: user.nomineeMobile,
        },
        reference: user.reference,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        approvedAt: user.approvedAt,
        role: user.role,
        createdAt: user.createdAt,
      },
      dps: {
        totalDeposit: dps.totalDeposit,
        maturityDate: dps.maturityDate,
        interestMultiplier: dps.interestMultiplier,
        earlyWithdrawPenalty: dps.earlyWithdrawPenalty,
        isClosed: dps.isClosed,
        createdAt: dps.createdAt,
      },
      deposits,
      withdrawals,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in withdrawn user detail fetch:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getWithdrawnUserFullDetails,
};
