import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { createCampaign, getBrandCampaigns, getAllCampaigns, deleteCampaign, updateCampaignProgress } from '../controllers/campaignController.js';

const campaignRoutes = new Hono();

// Apply auth middleware to all routes
campaignRoutes.use('*', authMiddleware);

// Public (Authenticated) Routes
campaignRoutes.get('/', getAllCampaigns);

// Brand-Only Routes
campaignRoutes.post('/', requireRole('brand'), createCampaign);
campaignRoutes.get('/my-campaigns', requireRole('brand'), getBrandCampaigns);
campaignRoutes.delete('/:id', requireRole('brand'), deleteCampaign);
campaignRoutes.put('/:id/progress', requireRole('brand'), updateCampaignProgress);

export default campaignRoutes;
