import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { 
  createDeal, 
  updateDealStage, 
  cancelDeal, 
  getDeal, 
  getUserDeals 
} from '../controllers/dealController.js';

const router = new Hono();

// Public routes (if needed for deal discovery)
// router.get('/', getUserDeals);

// Protected routes
router.use('*', authMiddleware);

router.post('/', createDeal);
router.get('/user', getUserDeals);
router.get('/:id', getDeal);
router.put('/:id/update-stage', updateDealStage);
router.post('/:id/cancel', cancelDeal);

export default router;
