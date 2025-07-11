// const User = require("../Model/userModel");

// // ইউজারের নিজের তথ্য দেখানো
// const getMe = async (req, res) => {
//   const user = await User.findById(req.userid).select("-password");
//   res.status(200).json(user);
// };

// // ইউজার প্রোফাইল আপডেট
// const updateProfile = async (req, res) => {
//   const updated = await User.findByIdAndUpdate(
//     req.userid,
//     req.body,
//     { new: true }
//   ).select("-password");

//   res.status(200).json({
//     message: "Profile updated successfully",
//     user: updated,
//   });
// };

// module.exports = { getMe, updateProfile };






const User = require("../Model/userModel");

// ইউজারের নিজের তথ্য দেখানো
const getMe = async (req, res) => {
  const user = await User.findById(req.userid).select("-password");
  res.status(200).json(user);
};

// ইউজার প্রোফাইল আপডেট (ইমেজসহ)
const updateProfile = async (req, res) => {
  try {
    let updatedData = req.body;

    if (req.file) {
      const imagePath = `http://localhost:7000/uploads/${req.file.filename}`;
      updatedData.image = imagePath;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userid,
      updatedData,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};

module.exports = { getMe, updateProfile };
