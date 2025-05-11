const nodemailer = require('nodemailer');
const { EMAIL_FROM, EMAIL, EMAIL_PASS } = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Change this for other providers (e.g., 'SendGrid', 'Outlook')
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
