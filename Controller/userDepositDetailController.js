// Controller/userDepositDetailController.js

const Deposit = require('../Model/depositModel');
const User = require('../Model/userModel');

const userDepositDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deposits = await Deposit.find({ userId: id }).sort({ month: 1 });

    res.json({
      user: {
        id: user._id,
        firstname: user.firstName,
        lastname: user.lastName,
        mobile: user.mobile,
        email: user.email,
        nid: user.nid,
        address: user.address,
        image: user.image,
        nominee: user.nomineeName,
        nomineemobile: user.nomineeMobile,
        nomineerelation: user.nomineeRelation,
        reference: user.reference,
        approvedAt: user.approvedAt
      },
      deposits
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = userDepositDetail;
