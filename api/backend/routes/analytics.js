import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getAnalytics, updateAnalyticsFromSocial, getROIAnalysis } from '../controllers/analyticsController.js';

const analytics = new Hono();

analytics.get('/campaign/:campaignId', authMiddleware, getAnalytics);
analytics.post('/update', authMiddleware, updateAnalyticsFromSocial);
analytics.get('/roi', authMiddleware, getROIAnalysis);

export default analytics;
