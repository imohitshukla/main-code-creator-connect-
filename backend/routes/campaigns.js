import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getCampaigns, createCampaign, applyToCampaign, getCampaignDashboard, updateCampaignProgress } from '../controllers/campaignController.js';

const router = new Hono();

// Public routes
router.get('/', getCampaigns);

// Protected routes
router.use('*', authMiddleware);
router.post('/', createCampaign);
router.post('/:id/apply', applyToCampaign);
router.get('/dashboard', getCampaignDashboard);
router.put('/:id/progress', updateCampaignProgress);

export default router;
