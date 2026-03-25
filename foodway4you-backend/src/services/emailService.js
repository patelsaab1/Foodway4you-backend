import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

const send = async ({ to, subject, html }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  return transporter.sendMail({ from, to, subject, html });
};

export { send };
