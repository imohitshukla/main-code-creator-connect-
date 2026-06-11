import { Hono } from 'hono';
import {
  getAllCreators,
  getAdminStats,
  updateCreatorVerification,
  getCreatorFraudHistory,
  bulkFraudCheck,
  getSystemHealth,
  getPlatformOverview,
  getAuditLogs,
  getPitchMatrix
} from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const adminRoutes = new Hono();

// Apply auth + ADMIN role check to ALL admin routes
adminRoutes.use('*', authMiddleware);
adminRoutes.use('*', requireRole('ADMIN'));

// ─── NEW: Founder Oversight Endpoints ───
adminRoutes.get('/platform-overview', getPlatformOverview);
adminRoutes.get('/audit-logs', getAuditLogs);
adminRoutes.get('/pitch-matrix', getPitchMatrix);

// ─── Existing Endpoints (preserved) ───
adminRoutes.get('/creators', getAllCreators);
adminRoutes.get('/stats', getAdminStats);
adminRoutes.put('/creators/:creatorId/verification', updateCreatorVerification);
adminRoutes.get('/creators/:creatorId/fraud-history', getCreatorFraudHistory);
adminRoutes.post('/fraud-check/bulk', bulkFraudCheck);
adminRoutes.get('/health', getSystemHealth);

export default adminRoutes;
