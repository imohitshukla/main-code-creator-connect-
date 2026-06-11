import { Hono } from 'hono'
import transporter from '../../../utils/sendEmail.js'

const app = new Hono()

app.get('/send-test-email', async (c) => {
  try {
    const info = await transporter.sendMail({
      from: `"Test Sender" <${process.env.EMAIL_USER}>`, // sender address
      to: process.env.EMAIL_USER, // list of receivers
      subject: "Test Email from Nodemailer Transporter", // Subject line
      text: "This is a test email sent using Nodemailer with Gmail SMTP on port 465.", // plain text body
      html: "<b>This is a test email sent using Nodemailer with Gmail SMTP on port 465.</b>", // html body
    });
    return c.json({ message: 'Test email sent successfully', messageId: info.messageId })
  } catch (error) {
    return c.json({ error: 'Failed to send test email', details: error.message }, 500)
  }
})

export default app
