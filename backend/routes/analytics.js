const { Hono } = require('hono');
const { authMiddleware } = require('../middleware/auth.js');
const { getAnalytics, updateAnalyticsFromSocial, getROIAnalysis } = require('../controllers/analyticsController.js');

const analytics = new Hono();

analytics.get('/campaign/:campaignId', authMiddleware, getAnalytics);
analytics.post('/update', authMiddleware, updateAnalyticsFromSocial);
analytics.get('/roi', authMiddleware, getROIAnalysis);

module.exports = analytics;
