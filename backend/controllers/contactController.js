import { client } from '../config/database.js';
import transporter from '../utils/sendEmail.js';

const submitContactForm = async (c) => {
  try {
    const { name, email, message } = await c.req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return c.json({
        error: 'Missing required fields',
        details: 'name, email, and message are required'
      }, 400);
    }

    // Insert contact submission into database
    const query = `
      INSERT INTO contact_submissions (name, email, message, submitted_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, email, submitted_at
    `;

    const values = [name, email, message];
    const result = await client.query(query, values);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'mohitshukla57662@gmail.com',
      replyTo: email,
      subject: 'New Contact Form Submission',
      text: `You have received a new contact form submission.

Name: ${name}
Email: ${email}
Message: ${message}

Please reply to this email to respond to the user.`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Contact form email sent successfully');
    } catch (emailError) {
      console.error('Failed to send contact form email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return c.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: result.rows[0]
    }, 201);

  } catch (error) {
    console.error('Contact form submission error:', error);
    return c.json({
      error: 'Internal server error',
      details: 'Failed to submit contact form'
    }, 500);
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

export {
  submitContactForm,
  getContactSubmissions
};
