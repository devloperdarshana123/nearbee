const { clerkClient, getAuth } = require("@clerk/express");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authorized, no valid session" });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "New User";

      user = await User.create({
        clerkId: userId,
        name,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        role: clerkUser.publicMetadata?.role === "provider" ? "provider" : "customer",
        referralCode: userId.slice(-8).toUpperCase(),
      });
    }

    if (!user.referralCode) {
      user.referralCode = user._id.toString().slice(-8).toUpperCase();
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "This account has been banned" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

module.exports = { protect, authorize };
