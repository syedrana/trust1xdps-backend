const depositrequest = require("../Model/depositRequest");
const withdraw = require("../Model/withdrawModel");

const depositRequestCount = async (req, res) => {
  try {
    const count = await depositrequest.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const withdrawCount = async (req, res) => {
  try {
    const count = await withdraw.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {depositRequestCount, withdrawCount };