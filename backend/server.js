require('dotenv').config();
const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const authRoutes = require('./routes/auth.js');
const creatorRoutes = require('./routes/creators.js');
const campaignRoutes = require('./routes/campaigns.js');
const aiRoutes = require('./src/backend/routes/ai.js');
const messageRoutes = require('./routes/messages.js');
const mediaKitRoutes = require('./routes/mediakits.js');
const educationRoutes = require('./routes/education.js');
const analyticsRoutes = require('./routes/analytics.js');
const paymentsRoutes = require('./routes/payments.js');
const adminRoutes = require('./routes/admin.js');

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/creators', creatorRoutes);
app.route('/api/campaigns', campaignRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/messages', messageRoutes);
app.route('/api/mediakits', mediaKitRoutes);
app.route('/api/education', educationRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/payments', paymentsRoutes);
app.route('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', message: 'CreatorConnect API is running' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Something went wrong!' }, 500);
});

// This line assumes you have a models/index.js file that exports your db object.
// If your file is elsewhere (like config/database.js), change the path.
const db = require('./models');

// Make sure PORT is defined.
const PORT = process.env.PORT || 5000;

// REPLACE your old "app.listen(PORT, ...)" with this new block:
db.sequelize.sync().then(() => {
  console.log('Database synced successfully.');
  const { serve } = require('@hono/node-server');

  serve({
    fetch: app.fetch,
    port: PORT
  }, (info) => {
    console.log(`Server is running on port ${info.port}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});

module  .exports = {
  port: PORT,
  fetch: app.fetch,
};
