const { Hono } = require('hono');
const { getEducationalResources, getResourceById, getResourceCategories } = require('../controllers/educationController.js');

const router = new Hono();

// Public routes
router.get('/', getEducationalResources);
router.get('/categories', getResourceCategories);
router.get('/:id', getResourceById);

module.exports = router;
