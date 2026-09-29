const { sendMail } = require("../config/mailer");

const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "name, email, and message are required" });
    }

    await sendMail({
      to: process.env.CONTACT_INBOX || process.env.SMTP_USER,
      subject: `New contact form message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    res.json({ message: "Message sent" });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContactForm };
