import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { 
  updateUserRole, 
  getCurrentUser 
} from '../controllers/userController.js';

const users = new Hono();

// Apply auth middleware to all routes
users.use('*', authMiddleware);

// Update user role
users.put('/role', updateUserRole);

// Get current user info
users.get('/me', getCurrentUser);

export default users;
