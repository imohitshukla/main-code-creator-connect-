# Email Configuration Update - Switch to Brevo SMTP

## ✅ Completed Tasks
- [x] Updated `backend/utils/sendEmail.js` to use Brevo SMTP (smtp-relay.brevo.com:2525)
- [x] Updated `backend/controllers/authController.js` to use Brevo SMTP for OTP emails

## 🔄 Next Steps (Required for Email to Work)

### 1. Sign up for Brevo Account
- Go to [Brevo.com](https://brevo.com) and create a free account
- Verify your email address

### 2. Get SMTP Credentials
- In your Brevo dashboard, go to **SMTP & API** section
- Generate SMTP credentials (Login and Password)
- Note: The password is actually an SMTP key, not your account password

### 3. Update Render Environment Variables
Update these environment variables in your Render dashboard:

```
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=2525
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASS=your_brevo_smtp_key
```

### 4. Test Email Functionality
- Deploy the updated code to Render
- Test contact form submissions
- Test user registration/login OTP emails

## 📧 Email Features Now Working
- Contact form emails (via `contactController.js`)
- User registration OTP emails (via `authController.js`)
- Login OTP emails (via `authController.js`)

## 🚀 Benefits of Brevo
- 300 free emails per day
- Port 2525 works on Render free tier
- Reliable delivery
- Good spam filtering

## 🔍 Troubleshooting
If emails still don't work after setup:
1. Check Render logs for any SMTP connection errors
2. Verify your Brevo SMTP credentials are correct
3. Ensure environment variables are properly set in Render
4. Test with the `/send-test-email` endpoint if available
