const { Hono } = require('hono');
const { authMiddleware } = require('../middleware/auth.js');
const { getCreators, getCreatorById, updateCreatorProfile, verifyCreator, getVerifiedCreators } = require('../controllers/creatorController.js');

const router = new Hono();

// Public routes
router.get('/', getCreators);
router.get('/:id', getCreatorById);
router.get('/verified', getVerifiedCreators);

// Protected routes
router.use('*', authMiddleware);
router.put('/profile', updateCreatorProfile);
router.put('/:id/verify', verifyCreator);

module.exports = router;
