const { Hono } = require('hono');
const { z } = require('zod');
const { zValidator } = require('@hono/zod-validator');
const {
  registerCreator,
  registerBrand,
  login,
  verifyLoginOtp,
  sendOtp,
  verifyOtp
} = require('../controllers/authController.js');

const auth = new Hono();

const registerCreatorSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  portfolio_link: z.string().url(),
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

auth.post('/register/creator', zValidator('json', registerCreatorSchema), registerCreator);
auth.post('/register/brand', zValidator('json', registerBrandSchema), registerBrand);
auth.post('/login', zValidator('json', loginSchema), login);
auth.post('/verify-login-otp', zValidator('json', verifyLoginOtpSchema), verifyLoginOtp);
auth.post('/send-otp', zValidator('json', sendOtpSchema), sendOtp);
auth.post('/verify-otp', zValidator('json', verifyOtpSchema), verifyOtp);

module.exports = authRoutes;