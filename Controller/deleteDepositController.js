const Deposit = require('../Model/depositModel');
const DPS = require('../Model/dpsModel');

const deleteDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    // ✅ DPS থেকে amount বাদ দিন
    const dps = await DPS.findOne({ userId: deposit.userId });
    if (dps) {
      dps.totalDeposit -= deposit.amount;

      // যদি totalDeposit 0 বা নেগেটিভ হয়, DPS মডেল ডিলিট করুন
      if (dps.totalDeposit <= 0) {
        await DPS.findByIdAndDelete(dps._id);
      } else {
        await dps.save();
      }
    }

    // ✅ Deposit ডিলিট করুন
    await Deposit.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    console.error('Error deleting deposit:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = deleteDeposit;
