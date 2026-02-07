import { Hono } from 'hono';
import { cookieAuthMiddleware } from '../middleware/cookieAuth.js';
import { 
  updateUserRole, 
  getCurrentUser 
} from '../controllers/userController.js';

const users = new Hono();

// Apply cookie auth middleware to all routes
users.use('*', cookieAuthMiddleware);

// Update user role
users.put('/role', updateUserRole);

// Get current user info
users.get('/me', getCurrentUser);

export default users;
