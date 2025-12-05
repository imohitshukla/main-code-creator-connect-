import transporter from '../utils/sendEmail.js';
import { client } from '../config/database.js';

export const submitContactForm = async (c) => {
  try {
    const body = await c.req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return c.json({
        error: 'Missing required fields',
        details: 'name, email, and message are required'
      }, 400);
    }

    console.log('📩 Processing contact submission for:', body.email);

    // 1. Save to Database
    const query = `
      INSERT INTO contact_submissions (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    await client.query(query, [body.name, body.email, body.message]);

    // 2. Send Email to Admin (You)
    // We use the user's name in the 'From' field but keep the authenticated email address to avoid spam blocks.
    // When you hit 'Reply', it will go to the user's email because of 'replyTo'.
    const adminMailOptions = {
      from: `"${body.name}" <${process.env.EMAIL_USER}>`,
      to: 'mohitshukla57662@gmail.com',
      replyTo: body.email, // This makes the "Reply" button work as expected
      subject: `New Message from ${body.name}`,
      text: `
You have received a new message via the Creator Connect Contact Form.

From: ${body.name} (${body.email})
Message:
${body.message}

--------------------------------------------------
Reply to this email to contact ${body.name} directly.
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${body.name} (<a href="mailto:${body.email}">${body.email}</a>)</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; border-left: 10px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
          ${body.message.replace(/\n/g, '<br>')}
        </blockquote>
        <hr>
        <p style="font-size: 0.9em; color: #666;">This email was sent from the Creator Connect contact form.</p>
      `
    };

    // 3. Send Confirmation Email to User
    const userMailOptions = {
      from: `"Creator Connect Team" <${process.env.EMAIL_USER}>`,
      to: body.email,
      subject: `We received your message!`,
      text: `Hi ${body.name},\n\nThank you for reaching out to Creator Connect. We have received your message and will get back to you shortly.\n\nYour Message:\n${body.message}\n\nBest regards,\nThe Creator Connect Team`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hi ${body.name},</h2>
          <p>Thank you for reaching out to <strong>Creator Connect</strong>. We have received your message and will get back to you shortly.</p>
          <hr>
          <p><strong>Your Message:</strong></p>
          <p><em>${body.message}</em></p>
          <hr>
          <p>Best regards,<br>The Creator Connect Team</p>
        </div>
      `
    };

    // Send emails and log the result
    const [adminInfo, userInfo] = await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log('✅ Admin Email Sent. MessageID:', adminInfo.messageId);
    console.log('✅ User Email Sent. MessageID:', userInfo.messageId);

    return c.json({ message: "Message Sent Successfully!" }, 201);

  } catch (error) {
    console.error("❌ SUBMISSION FAILED:", error);
    return c.json({ error: "Failed to process submission", details: error.message }, 500);
  }
};

const getContactSubmissions = async (c) => {
  try {
    const query = `
      SELECT id, name, email, message, submitted_at
      FROM contact_submissions
      ORDER BY submitted_at DESC
    `;

    const result = await client.query(query);

    return c.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return c.json({
      error: 'Internal server error',
      details: 'Failed to fetch contact submissions'
    }, 500);
  }
};

export { getContactSubmissions };
