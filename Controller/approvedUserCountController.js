const User = require("../Model/userModel");

const approvedUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isApproved: true });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting approved users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = approvedUserCount;
