const Deposit = require('../Model/depositModel');

const getUserDeposits = async (req, res) => {
  try {
    const userId = req.userid;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Optional: populate user if needed
    const deposits = await Deposit.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email mobile address nid nomineeName nomineeRelation nomineeMobile approvedAt')
      .select('-__v') // remove internal fields
      .lean();

    const enhancedDeposits = deposits.map((d) => ({
      id: d._id,
      receiptNo: d.receiptNo,
      transactionId: d._id,
      amount: d.amount,
      month: d.month,
      paymentMethod: d.paymentMethod,
      receivedBy: d.receivedBy,
      transaction: d.transaction,
      status: d.status,
      note: d.note,
      createdAt: d.createdAt,
      userId: d.userId,
    }));

    res.status(200).json(enhancedDeposits);
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = getUserDeposits;
