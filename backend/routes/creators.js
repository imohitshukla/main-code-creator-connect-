import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getCreators, getCreatorById, getCreatorByUsername, updateCreatorProfile, verifyCreator, getVerifiedCreators } from '../controllers/creatorController.js';

const router = new Hono();

// Public routes
router.get('/', getCreators);
router.get('/:username', getCreatorByUsername);
router.get('/:id', getCreatorById);
router.get('/verified', getVerifiedCreators);

// Protected routes
router.use('*', authMiddleware);
router.put('/profile', updateCreatorProfile);
router.put('/:id/verify', verifyCreator);

export default router;
