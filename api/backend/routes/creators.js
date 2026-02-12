import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getCreators, getCreatorById, getCreatorByUsername, getCreatorByIdentifier, updateCreatorProfile, verifyCreator, getVerifiedCreators, sendProposal, getCreatorProfile } from '../controllers/creatorController.js';

const router = new Hono();

// Public routes
router.get('/', getCreators);
router.get('/verified', getVerifiedCreators);
// Backwards-compatible explicit routes (kept for callers that use them directly)
router.get('/id/:id', getCreatorById);
router.get('/username/:username', getCreatorByUsername);

// Protected routes (Move profile specific GET here because it needs auth)
router.use('/profile', authMiddleware); // Ensure profile routes are protected
router.get('/profile', getCreatorProfile);
router.put('/profile', updateCreatorProfile);

// Public routes continues...
// NOTE: order matters. Static routes must be registered before param routes.
// Single identifier route avoids collisions between "/:username" and "/:id".
router.get('/:identifier', getCreatorByIdentifier);

// Other protected routes
router.use('*', authMiddleware);
router.put('/:id/verify', verifyCreator);
router.put('/:id/verify', verifyCreator);
router.post('/proposals', sendProposal);

export default router;
