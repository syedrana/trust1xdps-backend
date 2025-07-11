const express = require("express");
const router = express.Router();
const User = require("../Model/userModel");
const mongoose = require("mongoose");

let userapprove = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false });

    res.status(200).json({
      pendingUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = userapprove;