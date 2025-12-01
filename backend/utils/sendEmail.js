import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,  // <--- MUST BE 465
  secure: true, // <--- MUST BE TRUE
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add these lines to debug the error
  logger: true,
  debug: true
});

export default transporter;
