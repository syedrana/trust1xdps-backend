const User = require("../Model/userModel");


let userapprove = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await User.findByIdAndUpdate(
      id,
      {
        isApproved: true,
        approvedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({ message: "User approved", user: updated });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "User approval failed" });

  }
};

module.exports = userapprove;
