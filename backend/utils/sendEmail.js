import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,    // Your Brevo SMTP login
    pass: process.env.EMAIL_PASS,    // Your Brevo SMTP password/key
  },
  tls: {
    rejectUnauthorized: false // Helps avoid SSL errors on some clouds
  },
  // Keep these timeouts to prevent it from hanging forever
  connectionTimeout: 10000,
  greetingTimeout: 5000,
});

export default transporter;
