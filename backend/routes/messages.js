import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getMessages, sendMessage, getConversations, createConversation } from '../controllers/messagesController.js';

const router = new Hono();

// Apply auth to all routes
router.use('*', authMiddleware);

// Get user's conversations
router.get('/conversations', getConversations);

// Create a new conversation
router.post('/conversations', createConversation);

// Get messages for a conversation
router.get('/:conversationId', getMessages);

// Send a message
router.post('/', sendMessage);

export default router;
