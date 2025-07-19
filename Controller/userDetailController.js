const User = require("../Model/userModel");
const { cloudinary } = require("../Middleware/updateimg");

const getMe = async (req, res) => {
  const user = await User.findById(req.userid).select("-password");
  res.status(200).json(user);
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userid);
    if (!user) return res.status(404).send("User not found");

    if (req.file) {
      if (user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "trust1xdps/users",
      });
      req.body.image = result.secure_url;
      req.body.imagePublicId = result.public_id;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userid, req.body, { new: true }).select("-password");
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

module.exports = { getMe, updateProfile };

