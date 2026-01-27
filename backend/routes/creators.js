import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getCreators, getCreatorById, getCreatorByUsername, getCreatorByIdentifier, updateCreatorProfile, verifyCreator, getVerifiedCreators } from '../controllers/creatorController.js';

const router = new Hono();

// Public routes
router.get('/', getCreators);
router.get('/verified', getVerifiedCreators);
// Backwards-compatible explicit routes (kept for callers that use them directly)
router.get('/id/:id', getCreatorById);
router.get('/username/:username', getCreatorByUsername);

// NOTE: order matters. Static routes must be registered before param routes.
// Single identifier route avoids collisions between "/:username" and "/:id".
router.get('/:identifier', getCreatorByIdentifier);

// Protected routes
router.use('*', authMiddleware);
router.put('/profile', updateCreatorProfile);
router.put('/:id/verify', verifyCreator);

export default router;
