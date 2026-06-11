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
    // 1. Save to Database (Non-blocking)
    try {
      const query = `
        INSERT INTO contact_submissions (name, email, message)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      await client.query(query, [body.name, body.email, body.message]);
    } catch (dbError) {
      console.error('⚠️ Failed to save contact to DB (proceeding to email):', dbError.message);
    }

    // 2. Send Email to Admin
    // CRITICAL FIX: The 'from' address MUST be your verified sender in Brevo (e.g., your gmail),
    // NOT the SMTP Login ID (which is what process.env.EMAIL_USER contains).
    const verifiedSender = 'mohitshukla57662@gmail.com';

    const adminMailOptions = {
      from: `"Creator Connect" <${verifiedSender}>`,
      to: 'mohitshukla57662@gmail.com',
      replyTo: body.email, // Replies go to the user
      subject: `Contact: ${body.name}`,
      text: `
New message from: ${body.name} (${body.email})

${body.message}
      `
    };

    // 3. Send Confirmation Email to User
    const userMailOptions = {
      from: `"Creator Connect Team" <${verifiedSender}>`,
      to: body.email,
      subject: `Message Received`,
      text: `Hi ${body.name},\n\nWe received your message:\n\n"${body.message}"\n\nWe'll get back to you soon.\n\n- Creator Connect`
    };

    console.log('📨 Attempting to send emails...');
    console.log('👉 From (Verified):', verifiedSender);
    console.log('👉 To Admin:', 'mohitshukla57662@gmail.com');
    console.log('👉 To User:', body.email);

    const [adminInfo, userInfo] = await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log('✅ Admin Email Accepted by Brevo. ID:', adminInfo.messageId);
    console.log('✅ User Email Accepted by Brevo. ID:', userInfo.messageId);

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
