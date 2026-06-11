import { client } from '../config/database.js';
import transporter from '../utils/sendEmail.js';

export const subscribeToNewsletter = async (c) => {
    try {
        const { email } = await c.req.json();

        if (!email) {
            return c.json({ error: 'Email is required' }, 400);
        }

        // 1. Check if already subscribed
        const existing = await client.query('SELECT id FROM newsletter_subscribers WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return c.json({ message: 'You are already subscribed!' }, 200);
        }

        // 2. Save to DB
        await client.query('INSERT INTO newsletter_subscribers (email) VALUES ($1)', [email]);

        // 3. Send Welcome Email (Non-blocking usually, but await here for simplicity)
        const mailOptions = {
            from: `"Creator Connect" <mohitshukla57662@gmail.com>`,
            to: email,
            subject: 'Welcome to the Creator Connect Newsletter!',
            text: `Hi there,\n\nThanks for subscribing to our newsletter. You're now in the loop for the latest trends in influencer marketing.\n\n- The Creator Connect Team`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the request if email fails, as DB save succeeded
        }

        return c.json({ message: 'Successfully subscribed!' }, 201);
    } catch (error) {
        console.error('Newsletter Subscription Error:', error);
        return c.json({ error: 'Failed to subscribe' }, 500);
    }
};
