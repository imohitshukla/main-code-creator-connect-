import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // This will now be smtp-relay.brevo.com
  port: process.env.EMAIL_PORT, // This will be 587
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Debug logs to verify connection
  logger: true,
  debug: true
});

export default transporter;
