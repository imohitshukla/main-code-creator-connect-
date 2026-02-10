import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  registerCreator,
  registerBrand,
  login,
  verifyLoginOtp,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { signup } from '../controllers/authController.js';
import { client } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';

const auth = new Hono();

const registerCreatorSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  portfolio_link: z.string().url().optional(),
  phone_number: z.string().min(10).max(15),
});

const registerBrandSchema = z.object({
  company_name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  phone_number: z.string().min(10).max(15),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const sendOtpSchema = z.object({
  phone_number: z.string().min(10).max(15),
});

const verifyOtpSchema = z.object({
  phone_number: z.string().min(10).max(15),
  otp: z.string().length(6),
});

const verifyLoginOtpSchema = z.object({
  userId: z.number(),
  otp: z.string().length(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

auth.post('/register/creator', zValidator('json', registerCreatorSchema), registerCreator);
auth.post('/register/brand', zValidator('json', registerBrandSchema), registerBrand);
auth.post('/signup', zValidator('json', signupSchema), signup);
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = await c.req.json();

  try {
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = userResult.rows[0];
    const isValid = await import('bcryptjs').then(bcrypt => bcrypt.compare(password, user.password));

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🍪 TACTIC 1: Set the Cookie (Standard)
    const { setCookie } = await import('hono/cookie');
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      domain: '.creatorconnect.tech',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // 📦 TACTIC 2: Return Token in Body (For Redundancy)
    return c.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        // ... add other necessary fields
        token // <--- 🚨 SEND TOKEN TO FRONTEND HERE
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
auth.post('/verify-login-otp', zValidator('json', verifyLoginOtpSchema), verifyLoginOtp);
auth.post('/send-otp', zValidator('json', sendOtpSchema), sendOtp);
auth.post('/verify-otp', zValidator('json', verifyOtpSchema), verifyOtp);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

auth.post('/forgot-password', zValidator('json', forgotPasswordSchema), forgotPassword);
auth.post('/reset-password', zValidator('json', resetPasswordSchema), resetPassword);

// 🚨 CRITICAL: Add /me endpoint for session check
auth.get('/me', authMiddleware, async (c) => {
  // 1. Get's user from Context (set by your middleware)
  const user = c.get('user');

  if (!user) {
    return c.json({ authenticated: false }, 401);
  }

  // 2. Return's user data
  return c.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      company_name: user.company_name,
      phone_number: user.phone_number,
      portfolio_link: user.portfolio_link
      // ... any other fields you need
    }
  });
});

// Temporary route to bypass login for testing (only for dev)
auth.post('/login-bypass', async (c) => {
  const { email } = await c.req.json();

  try {
    const userResult = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = userResult.rows[0];

    // Manually generate JWT without password check for testing
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({ token, user });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;
