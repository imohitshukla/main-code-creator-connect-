import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { createCampaign, getBrandCampaigns, getAllCampaigns, deleteCampaign, updateCampaignProgress, applyToCampaign } from '../controllers/campaignController.js';

const campaignRoutes = new Hono();

// Apply auth middleware to all routes
campaignRoutes.use('*', authMiddleware);

// Public (Authenticated) Routes
campaignRoutes.get('/', getAllCampaigns);

// Creator-Only Routes
campaignRoutes.post('/:id/apply', requireRole('creator'), applyToCampaign);

// Brand-Only Routes
campaignRoutes.post('/', requireRole('brand'), createCampaign);
campaignRoutes.get('/my-campaigns', requireRole('brand'), getBrandCampaigns);
campaignRoutes.delete('/:id', requireRole('brand'), deleteCampaign);
campaignRoutes.put('/:id/progress', requireRole('brand'), updateCampaignProgress);

export default campaignRoutes;
