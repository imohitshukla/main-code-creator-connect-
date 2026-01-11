import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth.js';
import { getCampaigns, createCampaign, applyToCampaign, getCampaignDashboard, updateCampaignProgress } from '../controllers/campaignController.js';

const router = new Hono();

const createCampaignSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    budget_range: z.string().min(1, 'Budget is required'),
    niche: z.string().optional(),
    is_urgent: z.boolean().optional(),
    is_featured: z.boolean().optional()
});

// Public routes
router.get('/', getCampaigns);

// Protected routes
router.use('*', authMiddleware);
router.post('/', zValidator('json', createCampaignSchema), createCampaign);
router.post('/:id/apply', applyToCampaign);
router.get('/dashboard', getCampaignDashboard);
router.put('/:id/progress', updateCampaignProgress);

export default router;
