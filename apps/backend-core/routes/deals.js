import { Hono } from 'hono';
import {
  createDeal,
  getDealById,
  updateDealStatus,
  terminateDeal,
  getUserDeals,
  getDealTimeline
} from '../controllers/dealController.js';
import { authMiddleware } from '../middleware/auth.js';

const deals = new Hono();

// Protect all deal routes
deals.use('*', authMiddleware);

deals.post('/', createDeal);
deals.get('/my-deals', getUserDeals); // specific route before :id
deals.get('/:id', getDealById);
deals.patch('/:id/status', updateDealStatus);
deals.post('/:id/terminate', terminateDeal);
deals.get('/:id/timeline', getDealTimeline);

export default deals;
