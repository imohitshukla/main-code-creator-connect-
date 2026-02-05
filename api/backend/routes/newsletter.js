import { Hono } from 'hono';
import { subscribeToNewsletter } from '../controllers/newsletterController.js';

const router = new Hono();

router.post('/subscribe', subscribeToNewsletter);

export default router;
