import { Hono } from 'hono';
import { submitContactForm, getContactSubmissions } from '../controllers/contactController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = new Hono();

// Public route - submit contact form
router.post('/', submitContactForm);

// Protected route - get all contact submissions (admin only)
router.get('/', authMiddleware, getContactSubmissions);

export default router;
