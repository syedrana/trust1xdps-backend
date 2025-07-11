const User = require("../Model/userModel");

let approveuser = async (req, res) => {
  try {
    const users = await User.find({ isApproved: true });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = approveuser;
