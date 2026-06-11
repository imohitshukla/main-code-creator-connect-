
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { createBrandProfile, getBrandProfile, updateBrandProfile } from '../controllers/brandController.js';

const brands = new Hono();

// 🔒 Protected Routes (User must be logged in)
brands.post('/profile', authMiddleware, createBrandProfile);
brands.get('/profile', authMiddleware, getBrandProfile);
brands.put('/profile', authMiddleware, updateBrandProfile);

export default brands;
