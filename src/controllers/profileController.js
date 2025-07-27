const User = require("../models/user");
const mongoose = require("mongoose");

const allowedFields = ["firstName", "lastName", "age", "gender"];

exports.getLoggedInUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getOtherUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select(allowedFields);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const updatedData = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { new: true, runValidators: true }
    ).select(allowedFields);

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
