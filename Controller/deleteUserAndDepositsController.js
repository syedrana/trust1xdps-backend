const User = require("../Model/userModel");
const Deposit = require("../Model/depositModel");

const deleteUserAndDeposits = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: ইউজার আছে কিনা দেখি
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: ইউজার ডিলিট
    await User.findByIdAndDelete(id);

    // ✅ Step 3: ঐ ইউজারের সব ডিপোজিট ডিলিট
    await Deposit.deleteMany({ userId: id });

    return res.status(200).json({ message: "User and all related deposits deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  deleteUserAndDeposits,
};
