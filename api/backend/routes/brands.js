import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { 
  createBrandProfile, 
  getBrandProfile, 
  updateBrandProfile 
} from '../controllers/brandController.js';

const brands = new Hono();

// Apply auth middleware to all routes
brands.use('*', authMiddleware);

// Create brand profile
brands.post('/profile', createBrandProfile);

// Get brand profile
brands.get('/profile', getBrandProfile);

// Update brand profile
brands.put('/profile', updateBrandProfile);

export default brands;
