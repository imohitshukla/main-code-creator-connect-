import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailNotification = async ({ to, subject, html, from }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: from || 'noreply@creatorconnect.tech',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
};

export const generateMessageEmailHTML = (senderName, content, conversationId) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Creator Connect</h1>
          <p>New Message Received</p>
        </div>
        
        <div class="content">
          <h2>Message from ${senderName}</h2>
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 10px 0;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://creatorconnect.tech/inbox/${conversationId}" class="button">
              Reply on Creator Connect
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This message was sent via Creator Connect platform.</p>
          <p>Click the button above to reply directly in your inbox.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
