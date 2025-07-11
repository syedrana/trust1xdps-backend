const User = require("../Model/userModel");


// let rejectuser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.findByIdAndDelete(id);
//     res.status(200).json({ message: "User rejected and deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "User rejection failed" });
//   }
// };

let rejectuser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already approved
    if (user.isApproved) {
      return res.status(403).json({ message: "Approved users cannot be deleted" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User rejected and deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "User rejection failed" });
  }
};

module.exports = rejectuser;