const User = require("../Model/userModel");
const Deposit = require("../Model/depositModel");
const DPS = require("../Model/dpsModel");
const DepositRequest = require("../Model/depositRequest");
const WithdrawRequest = require("../Model/withdrawModel");

const deleteUserAndDeposits = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔍 Step 1: ইউজার আছে কিনা যাচাই
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚠️ Step 2: সব রেকর্ড ডিলিট করো
    await Promise.all([
      User.findByIdAndDelete(id),                          // ইউজার প্রোফাইল
      Deposit.deleteMany({ userId: id }),                  // ডিপোজিট
      DPS.deleteOne({ userId: id }),                       // DPS
      DepositRequest.deleteMany({ userId: id }),           // ডিপোজিট রিকোয়েস্ট
      WithdrawRequest.deleteMany({ userId: id }),          // উইথড্র রিকোয়েস্ট
    ]);

    return res.status(200).json({ message: "User and all related records deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  deleteUserAndDeposits,
};

