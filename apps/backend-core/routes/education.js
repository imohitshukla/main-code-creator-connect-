import { Hono } from 'hono';
import { getEducationalResources, getResourceById, getResourceCategories } from '../controllers/educationController.js';

const router = new Hono();

// Public routes
router.get('/', getEducationalResources);
router.get('/categories', getResourceCategories);
router.get('/:id', getResourceById);

export default router;
