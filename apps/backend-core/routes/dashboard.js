import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import {
  getDashboard,
  getBrandDashboard,
  getOnboardingFlow
} from '../controllers/dashboardController.js';

const dashboard = new Hono();

// Apply auth middleware to all routes
dashboard.use('*', authMiddleware);

// Get role-specific dashboard
dashboard.get('/', getDashboard);
dashboard.get('/brand', getBrandDashboard);

// Get onboarding flow based on user role
dashboard.get('/onboarding', getOnboardingFlow);

export default dashboard;
