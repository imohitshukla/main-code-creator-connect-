import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import {
  sendMessage,
  getConversationMessages,
  getUserConversations,
  getDealConversation
} from '../controllers/messageController.js';

const router = new Hono();

// Apply auth to all routes
router.use('*', authMiddleware);

// Get user's conversations
router.get('/conversations', getUserConversations);

// Get messages for a conversation
router.get('/conversation/:id', getConversationMessages);

// Get conversation for a specific deal
router.get('/deal/:dealId', getDealConversation);

// Send a message
router.post('/', sendMessage);

export default router;
