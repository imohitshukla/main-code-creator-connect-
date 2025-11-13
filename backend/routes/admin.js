const { Hono } = require('hono');
const {
  getAllCreators,
  getAdminStats,
  updateCreatorVerification,
  getCreatorFraudHistory,
  bulkFraudCheck,
  getSystemHealth
} = require('../controllers/adminController.js');
const { authMiddleware } = require('../middleware/auth.js');

const adminRoutes = new Hono();

// Apply auth middleware to all admin routes
adminRoutes.use('*', authMiddleware);

// Admin-only routes (would need additional admin role check in production)
adminRoutes.get('/creators', getAllCreators);
adminRoutes.get('/stats', getAdminStats);
adminRoutes.put('/creators/:creatorId/verification', updateCreatorVerification);
adminRoutes.get('/creators/:creatorId/fraud-history', getCreatorFraudHistory);
adminRoutes.post('/fraud-check/bulk', bulkFraudCheck);
adminRoutes.get('/health', getSystemHealth);

module.exports = adminRoutes;
