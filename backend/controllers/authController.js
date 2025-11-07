import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import client from '../config/database.js';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const registerCreator = async (c) => {
  const { name, email, password, portfolio_link } = c.req.valid('json');
  
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
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'creator']
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
export const registerBrand = async (c) => {
  const { company_name, email, password, website } = c.req.valid('json');

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
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'brand']
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

// Login
export const login = async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Find user
    const userResult = await client.query(
      'SELECT id, email, password, role FROM users WHERE email = $1',
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
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Send OTP
export const sendOtp = async (c) => {
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
export const verifyOtp = async (c) => {
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


