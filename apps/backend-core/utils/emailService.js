
import nodemailer from 'nodemailer';

// Professional Email Service Configuration
// Centralizes logic to ensure inconsistent 'from' addresses don't break delivery.

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // Fixes common SSL issues on cloud hosting
    }
});

// The verified sender address MUST be used for Brevo/Sendinblue
const VERIFIED_SENDER = 'mohitshukla57662@gmail.com';

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Niche Connect" <${VERIFIED_SENDER}>`, // Professional "Name <email>" format
            to,
            subject,
            text, // Fallback for clients that don't render HTML
            html,
        });
        console.log(`✅ Email sent successfully to ${to}. MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        // Don't throw, return success: false so the app can handle gracefully
        return { success: false, error: error.message };
    }
};
