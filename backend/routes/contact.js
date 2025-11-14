const { Hono } = require('hono');
const { submitContactForm, getContactSubmissions } = require('../controllers/contactController');
const { authMiddleware } = require('../middleware/auth');

const router = new Hono();

// Public route - submit contact form
router.post('/', submitContactForm);

// Protected route - get all contact submissions (admin only)
router.get('/', authMiddleware, getContactSubmissions);

module.exports = router;
