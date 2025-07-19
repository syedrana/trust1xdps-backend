const Deposit = require('../Model/depositModel');
const DPS = require('../Model/dpsModel');

const updateDeposit = async (req, res) => {
  const { id } = req.params;
  const { amount, month, paymentMethod, receivedBy, note, status } = req.body;

  try {
    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    // ✅ DPS এর totalDeposit adjust করতে আগের amount বের করুন
    const oldAmount = deposit.amount;

    // ✅ Update deposit fields
    deposit.amount = amount ?? deposit.amount;
    deposit.month = month ?? deposit.month;
    deposit.paymentMethod = paymentMethod ?? deposit.paymentMethod;
    deposit.receivedBy = receivedBy ?? deposit.receivedBy;
    deposit.note = note ?? deposit.note;
    deposit.status = status ?? deposit.status;

    await deposit.save();

    // ✅ DPS Update: যদি deposit এর amount change হয়
    if (amount && amount !== oldAmount) {
      const dps = await DPS.findOne({ userId: deposit.userId });
      if (dps) {
        // DPS totalDeposit থেকে oldAmount বাদ দিয়ে new amount যোগ করুন
        dps.totalDeposit = dps.totalDeposit - oldAmount + amount;
        await dps.save();
      }
    }

    res.status(200).json({ message: "Deposit updated successfully", deposit });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = updateDeposit;

