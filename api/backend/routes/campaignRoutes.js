import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { createCampaign, getBrandCampaigns, getAllCampaigns, deleteCampaign } from '../controllers/campaignController.js';

const campaignRoutes = new Hono();

// Apply auth middleware to all routes
campaignRoutes.use('*', authMiddleware);

// Public (Authenticated) Routes
campaignRoutes.get('/', getAllCampaigns);

// Brand-Only Routes
campaignRoutes.post('/', requireRole('brand'), createCampaign);
campaignRoutes.get('/my-campaigns', requireRole('brand'), getBrandCampaigns);
campaignRoutes.delete('/:id', requireRole('brand'), deleteCampaign);

export default campaignRoutes;
