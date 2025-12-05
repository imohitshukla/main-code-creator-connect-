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

    // 1. Save to Database
    const query = `
      INSERT INTO contact_submissions (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    await client.query(query, [body.name, body.email, body.message]);

    // 2. Send Email to Admin
    const adminMailOptions = {
      from: `Creator Connect System <${process.env.EMAIL_USER}>`,
      to: 'mohitshukla57662@gmail.com',
      replyTo: body.email,
      subject: `New Contact Form Submission from ${body.name}`,
      text: `
        Name: ${body.name}
        Email: ${body.email}
        Message: ${body.message}
      `
    };

    // 3. Send Confirmation Email to User
    const userMailOptions = {
      from: `Creator Connect Team <${process.env.EMAIL_USER}>`,
      to: body.email,
      subject: `We received your message!`,
      text: `Hi ${body.name},\n\nThank you for reaching out to Creator Connect. We have received your message and will get back to you shortly.\n\nYour Message:\n${body.message}\n\nBest regards,\nThe Creator Connect Team`
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    return c.json({ message: "Message Sent Successfully!" }, 201);

  } catch (error) {
    console.error("❌ SUBMISSION FAILED:", error);
    return c.json({ error: "Failed to process submission" }, 500);
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
