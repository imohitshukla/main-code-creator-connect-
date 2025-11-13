const { Hono } = require('hono');
const { authMiddleware } = require('../middleware/auth.js');
const { generateMediaKit, getMediaKitData } = require('../controllers/mediaKitController.js');

const router = new Hono();

// Protected routes
router.use('*', authMiddleware);
router.post('/generate', generateMediaKit);
router.get('/data', getMediaKitData);

module.exports = router;
