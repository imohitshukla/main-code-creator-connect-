import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { registerCreator, registerBrand, login } from '../controllers/authController.js';

const auth = new Hono();

const registerCreatorSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  portfolio_link: z.string().url(),
});

const registerBrandSchema = z.object({
  company_name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

auth.post('/register/creator', zValidator('json', registerCreatorSchema), registerCreator);
auth.post('/register/brand', zValidator('json', registerBrandSchema), registerBrand);
auth.post('/login', zValidator('json', loginSchema), login);

export default auth;