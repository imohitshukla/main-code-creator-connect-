import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,              // <--- Try 587 instead of 465
  secure: false,          // <--- Must be FALSE for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps avoid SSL errors on some clouds
  },
  // Keep these timeouts to prevent it from hanging forever
  connectionTimeout: 10000,
  greetingTimeout: 5000,
});

export default transporter;
