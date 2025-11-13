const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const client = require('../config/database.js');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Nodemailer transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const registerCreator = async (c) => {
  const { name, email, password, portfolio_link, phone_number } = c.req.valid('json');
  
  try {
    // Check if user exists
    const userExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await client.query('BEGIN');

    // Create user
    const newUser = await client.query(
      'INSERT INTO users (email, password, role, phone_number) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, 'creator', phone_number]
    );

    const userId = newUser.rows[0].id;

    // Create creator profile
    await client.query(
      `INSERT INTO creator_profiles (user_id, name, portfolio_links) 
       VALUES ($1, $2, $3)`,
      [userId, name, JSON.stringify([portfolio_link])]
    );

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'creator' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: userId, email, role: 'creator', name }
    }, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Register Brand
 const registerBrand = async (c) => {
  const { company_name, email, password, website, phone_number } = c.req.valid('json');

  try {
    // Check if user exists
    const userExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await client.query('BEGIN');

    // Create user
    const newUser = await client.query(
      'INSERT INTO users (email, password, role, phone_number) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, 'brand', phone_number]
    );

    const userId = newUser.rows[0].id;

    // Create brand profile
    await client.query(
      `INSERT INTO brand_profiles (user_id, company_name, website)
       VALUES ($1, $2, $3)`,
      [userId, company_name, website]
    );

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'brand' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: userId, email, role: 'brand', company_name }
    }, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Login - Send OTP
 const login = async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Find user
    const userResult = await client.query(
      'SELECT id, email, password, role, phone_number FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP and expiration
    await client.query(
      'UPDATE users SET phone_otp = $1, otp_expires_at = $2 WHERE id = $3',
      [otp, expiresAt, user.id]
    );

    // Send OTP via email (primary) and SMS (if phone available)
    try {
      // Send email OTP
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Login OTP - Niche Connect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Login Verification</h2>
            <p>Your OTP for login is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });

      // Send SMS OTP if phone number exists
      if (user.phone_number) {
        await twilioClient.messages.create({
          body: `Your login OTP for Niche Connect is: ${otp}. This code expires in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phone_number,
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Log OTP for development/testing if sending fails
      console.log(`Login OTP for ${user.email}: ${otp}`);
    }

    return c.json({
      message: 'OTP sent to your email' + (user.phone_number ? ' and phone' : ''),
      userId: user.id,
      requiresOtp: true
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Verify Login OTP
const verifyLoginOtp = async (c) => {
  const { userId, otp } = c.req.valid('json');

  try {
    // Find user by ID
    const userResult = await client.query(
      'SELECT id, email, role, phone_otp, otp_expires_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    // Check if OTP matches and hasn't expired
    if (user.phone_otp !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return c.json({ error: 'OTP has expired' }, 400);
    }

    // Clear OTP fields
    await client.query(
      'UPDATE users SET phone_otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
};

// Send OTP
 const sendOtp = async (c) => {
  const { phone_number } = c.req.valid('json');

  try {
    // Check if user exists with this phone number
    const userResult = await client.query(
      'SELECT id FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found with this phone number' }, 404);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP and expiration
    await client.query(
      'UPDATE users SET phone_otp = $1, otp_expires_at = $2 WHERE phone_number = $3',
      [otp, expiresAt, phone_number]
    );

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your OTP for phone verification is: ${otp}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone_number,
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      // Log OTP for development/testing if Twilio fails
      console.log(`OTP for ${phone_number}: ${otp}`);
      // Still return success as OTP was generated and saved
      // In production, you might want to return an error here
    }

    return c.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to send OTP' }, 500);
  }
};

// Verify OTP
 const verifyOtp = async (c) => {
  const { phone_number, otp } = c.req.valid('json');

  try {
    // Find user by phone number
    const userResult = await client.query(
      'SELECT id, phone_otp, otp_expires_at FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    // Check if OTP matches and hasn't expired
    if (user.phone_otp !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return c.json({ error: 'OTP has expired' }, 400);
    }
    module.exports = {
  registerCreator,
  registerBrand,
  login,
  verifyLoginOtp,
  sendOtp,
  verifyOtp
};

    // Update user: set verified, clear OTP fields
    await client.query(
      'UPDATE users SET is_phone_verified = TRUE, phone_otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    return c.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
};


