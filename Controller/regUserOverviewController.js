const express = require("express");
const router = express.Router();
const User = require("../Model/userModel");
const mongoose = require("mongoose");

let userapprove = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const todayUsers = await User.countDocuments({ createdAt: { $gte: startOfDay } });
    const weeklyUsers = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
    const monthlyUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const yearlyUsers = await User.countDocuments({ createdAt: { $gte: startOfYear } });

    const pendingUsers = await User.find({ isApproved: false });

    res.status(200).json({
      totalUsers,
      todayUsers,
      weeklyUsers,
      monthlyUsers,
      yearlyUsers,
      pendingUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = userapprove;