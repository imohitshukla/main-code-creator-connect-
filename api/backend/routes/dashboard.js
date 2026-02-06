import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { 
  getDashboard, 
  getOnboardingFlow 
} from '../controllers/dashboardController.js';

const dashboard = new Hono();

// Apply auth middleware to all routes
dashboard.use('*', authMiddleware);

// Get role-specific dashboard
dashboard.get('/', getDashboard);

// Get onboarding flow based on user role
dashboard.get('/onboarding', getOnboardingFlow);

export default dashboard;
