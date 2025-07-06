const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  // Set up transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  // Send email
  return transporter.sendMail({
    from: `"Social Dev Support" <${process.env.GOOGLE_EMAIL}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
