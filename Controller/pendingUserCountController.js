const User = require("../Model/userModel");

const pendingUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isApproved: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = pendingUserCount;
