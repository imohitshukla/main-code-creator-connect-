import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,            // <--- CHANGE THIS to 465
  secure: true,         // <--- MUST BE TRUE for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add these timeouts so it doesn't hang for 2 minutes if it fails
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
});

export default transporter;
