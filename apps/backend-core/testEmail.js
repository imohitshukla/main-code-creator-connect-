// backend/testEmail.js
import 'dotenv/config'; // Load your .env variables
import transporter from './utils/sendEmail.js';

async function sendTestEmail() {
  console.log("---------------------------------------");
  console.log("📧 STARTING EMAIL SELF-TEST...");
  console.log(`👤 Sending FROM: ${process.env.EMAIL_USER}`);
  console.log(`👤 Sending TO:   ${process.env.EMAIL_USER}`);

  // 1. Use the updated transporter from sendEmail.js

  // 2. Define the email options (Self-sending)
  const mailOptions = {
    from: `Debug Script <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: '🚨 Test Email from Debug Script',
    text: 'If you are reading this, your Node.js configuration is CORRECT and Gmail accepted the message.',
    html: '<h3>✅ Success!</h3><p>If you are reading this, your Node.js configuration is <strong>CORRECT</strong> and Gmail accepted the message.</p>'
  };

  // 3. Attempt to send
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("---------------------------------------");
    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("🆔 Message ID:", info.messageId);
    console.log("---------------------------------------");
    console.log("👉 CHECK YOUR INBOX (AND SPAM FOLDER) NOW.");
  } catch (error) {
    console.log("---------------------------------------");
    console.log("❌ ERROR SENDING EMAIL");
    console.error(error);
    console.log("---------------------------------------");
  }
}

sendTestEmail();
