const { Hono } = require('hono');
const { authMiddleware } = require('../middleware/auth.js');
const { getCampaigns, createCampaign, applyToCampaign, getCampaignDashboard, updateCampaignProgress } = require('../controllers/campaignController.js');

const router = new Hono();

// Public routes
router.get('/', getCampaigns);

// Protected routes
router.use('*', authMiddleware);
router.post('/', createCampaign);
router.post('/:id/apply', applyToCampaign);
router.get('/dashboard', getCampaignDashboard);
router.put('/:id/progress', updateCampaignProgress);

module.exports = router;
