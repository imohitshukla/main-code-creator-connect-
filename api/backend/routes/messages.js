import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  getConversations,
  getDealConversation
} from '../controllers/messagesController.js';

const router = new Hono();

// Apply auth to all routes
router.use('*', authMiddleware);

// Get user's conversations
router.get('/conversations', getConversations);

// Get messages for a conversation
router.get('/conversation/:conversationId', getMessages);

// Get conversation for a specific deal
router.get('/deal/:dealId', getDealConversation);

// Send a message
router.post('/', sendMessage);

export default router;
