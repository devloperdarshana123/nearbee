const Notification = require("../models/Notification");
const { notifyUser } = require("../config/socket");

const notify = async (userId, { type, message, link }) => {
  const notification = await Notification.create({ userId, type, message, link });
  notifyUser(userId.toString(), "notification", notification);
  return notification;
};

module.exports = { notify };
