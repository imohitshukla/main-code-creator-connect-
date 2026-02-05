import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { 
  sendMessage, 
  getConversationMessages, 
  getUserConversations 
} from '../controllers/messageController.js';

const router = new Hono();

// Apply auth to all routes
router.use('*', authMiddleware);

// Get user's conversations
router.get('/conversations', getUserConversations);

// Get messages for a conversation
router.get('/conversation/:id', getConversationMessages);

// Send a message
router.post('/', sendMessage);

export default router;
