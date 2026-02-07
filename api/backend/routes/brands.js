import { Hono } from 'hono';
import { cookieAuthMiddleware } from '../middleware/cookieAuth.js';
import { 
  createBrandProfile, 
  getBrandProfile, 
  updateBrandProfile 
} from '../controllers/brandController.js';

const brands = new Hono();

// Apply cookie auth middleware to all routes
brands.use('*', cookieAuthMiddleware);

// Create brand profile
brands.post('/profile', createBrandProfile);

// Get brand profile
brands.get('/profile', getBrandProfile);

// Update brand profile
brands.put('/profile', updateBrandProfile);

export default brands;
