const { clerkClient } = require("@clerk/express");
const User = require("../models/User");

const getMe = async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        referralCode: req.user.referralCode,
        hasBeenReferred: !!req.user.referredBy,
      },
    });
  } catch (err) {
    next(err);
  }
};

const applyReferral = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "code is required" });
    }
    if (req.user.referredBy) {
      return res.status(409).json({ message: "Referral already applied to this account" });
    }

    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer || referrer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    req.user.referredBy = referrer._id;
    await req.user.save();

    res.json({ message: "Referral applied" });
  } catch (err) {
    next(err);
  }
};

const getReferralStats = async (req, res, next) => {
  try {
    const referralCount = await User.countDocuments({ referredBy: req.user._id });
    res.json({ referralCode: req.user.referralCode, referralCount });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "name cannot be empty" });
      }
      req.user.name = name.trim();
    }
    if (phone !== undefined) req.user.phone = phone;

    await req.user.save();

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { role, phone } = req.body;
    const allowedRoles = ["customer", "provider"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "role must be customer or provider" });
    }

    if (role) req.user.role = role;
    if (phone !== undefined) req.user.phone = phone;
    await req.user.save();

    if (role) {
      await clerkClient.users.updateUserMetadata(req.user.clerkId, {
        publicMetadata: { role },
      });
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateProfile, updateRole, applyReferral, getReferralStats };
