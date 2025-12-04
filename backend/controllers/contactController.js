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

    // 2. Send Email
    const mailOptions = {
      from: `Creator Connect System <${process.env.EMAIL_USER}>`,
      to: 'mohitshukla57662@gmail.com', // Send to your actual Gmail
      replyTo: body.email,
      subject: `New Message from ${body.name}`,
      text: body.message
    };

    await transporter.sendMail(mailOptions);

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
