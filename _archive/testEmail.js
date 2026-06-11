import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function sendTestEmail() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.EMAIL_PORT) || 2525,
      secure: false,
      auth: {

        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: true
    });

    // Define email options
    const mailOptions = {
      from: `"Test Sender" <${process.env.EMAIL_USER}>`,
      to: 'mohitshukla57662@gmail.com', // Send to your actual Gmail, not the Brevo Login ID
      subject: 'Hello World Test Email',
      text: 'This is a test email sent using Nodemailer.',
      html: '<b>This is a test email sent using Nodemailer.</b>',
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Full SMTP Response:', info);

  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Run the function
sendTestEmail();
