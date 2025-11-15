const { Hono } = require('hono');
const { authMiddleware } = require('../../../middleware/auth.js');
const {
  smartMatchCreators,
  detectFraud,
  getPricingRecommendation,
  analyzeContent
} = require('../controllers/aiController.js');

const router = new Hono();

// Public routes (limited AI features for discovery)
router.post('/smart-match', smartMatchCreators);

// Protected routes (require authentication)
router.use('*', authMiddleware);

// AI-powered creator matching
router.post('/smart-match/authenticated', smartMatchCreators);

// Fraud detection for creators
router.post('/fraud-detect', detectFraud);

// Dynamic pricing recommendations
router.post('/pricing', getPricingRecommendation);

// Content analysis for visual content
router.post('/content-analysis', analyzeContent);

// Bulk fraud detection for admin
router.post('/bulk-fraud-check', async (c) => {
  try {
    const { creatorIds } = await c.req.json();
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Process multiple creators
    const results = await Promise.all(
      creatorIds.map(async (id) => {
        const result = await detectFraud({ ...c, req: { json: () => Promise.resolve({ creatorId: id }) } });
        return { creatorId: id, result: await result.json() };
      })
    );

    return c.json({ bulkResults: results });
  } catch (error) {
    console.error('Bulk Fraud Check Error:', error);
    return c.json({ error: 'Failed to perform bulk fraud check' }, 500);
  }
});

module.exports = router;
