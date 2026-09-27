import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import Message from "../models/Message.js";

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      userData,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== CHECK AUTH ====================
export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ==================== GET PROFILE ====================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic, bio, fullName },
      { new: true },
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== GET USER STATS ====================
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const messagesSent = await Message.countDocuments({ senderId: userId });
    const messagesReceived = await Message.countDocuments({
      receiverId: userId,
    });

    const sentTo = await Message.distinct("receiverId", { senderId: userId });
    const receivedFrom = await Message.distinct("senderId", {
      receiverId: userId,
    });
    const uniqueChats = new Set([
      ...sentTo.map((id) => id.toString()),
      ...receivedFrom.map((id) => id.toString()),
    ]).size;

    const lastMessage = await Message.findOne({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      stats: {
        messagesSent,
        messagesReceived,
        totalChats: uniqueChats,
        joinedAt: req.user.createdAt,
        lastActivity: lastMessage?.createdAt || req.user.createdAt,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
