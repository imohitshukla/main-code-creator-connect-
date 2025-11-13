const { Hono } = require('hono');
const { authMiddleware } = require('../middleware/auth.js');
const { getMessages, sendMessage, getConversations, createConversation } = require('../controllers/messagesController.js');

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

module.exports = router;
