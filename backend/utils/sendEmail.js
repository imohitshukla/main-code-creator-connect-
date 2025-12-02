import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 2525,              // <--- Brevo uses port 2525 (not blocked on Render free)
  secure: false,           // <--- Must be FALSE for 2525
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
