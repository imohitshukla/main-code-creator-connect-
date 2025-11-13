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

// Configure CORS to allow your Vercel frontend
app.use('*', cors({
  origin: [
    'https://main-code-creator-connect-hyl6kkqpp.vercel.app', // Your production Vercel URL
    'http://localhost:3000'                   // Your local computer (for testing)
  ],
  credentials: true // Allows cookies and authorization headers
}));

// Routes
app.use('/api/auth/*', authRoutes);
app.use('/api/creators/*', creatorRoutes);
app.use('/api/campaigns/*', campaignRoutes);
app.use('/api/ai/*', aiRoutes);
app.use('/api/messages/*', messageRoutes);
app.use('/api/mediakits/*', mediaKitRoutes);
app.use('/api/education/*', educationRoutes);
app.use('/api/analytics/*', analyticsRoutes);
app.use('/api/payments/*', paymentsRoutes);
app.use('/api/admin/*', adminRoutes);

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

// Make sure PORT is defined.
const PORT = process.env.PORT || 5000;

const { serve } = require('@hono/node-server');

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`);
});

module.exports = {
  port: PORT,
  fetch: app.fetch,
};
