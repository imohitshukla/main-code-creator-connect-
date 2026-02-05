import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { generateMediaKit, getMediaKitData } from '../controllers/mediaKitController.js';

const router = new Hono();

// Protected routes
router.use('*', authMiddleware);
router.post('/generate', generateMediaKit);
router.get('/data', getMediaKitData);

export default router;
