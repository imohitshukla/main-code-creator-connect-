import 'dotenv/config';
import { serve } from '@hono/node-server'; // Moved to top
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Route Imports
import authRoutes from '../backend/routes/auth.js';
import creatorRoutes from '../backend/routes/creators.js';
import campaignRoutes from '../backend/routes/campaigns.js';
import aiRoutes from '../backend/routes/ai.js'; // <--- FIXED PATH
import messageRoutes from '../backend/routes/messages.js';
import mediaKitRoutes from '../backend/routes/mediakits.js';
import educationRoutes from '../backend/routes/education.js';
import analyticsRoutes from '../backend/routes/analytics.js';
import paymentsRoutes from '../backend/routes/payments.js';
import adminRoutes from '../backend/routes/admin.js';
import contactRoutes from '../backend/routes/contact.js';

const app = new Hono();
const port = process.env.PORT || 10000;

// Configure CORS - Proper Hono CORS with dynamic origin function
const corsOptions = {
  origin: (origin, c) => {
    // Allow any origin that requests access
    return origin || '*';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Middleware
app.use('*', cors(corsOptions));
app.options('*', cors()); // Handle preflight requests
app.use('*', logger());

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
app.route('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', message: 'CreatorConnect API is running' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled Server Error:', err);
  return c.json({ error: 'Server crashed', message: err.message }, 500);
});

// Start Server
serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0' // Required for Render
}, (info) => {
  console.log(`Server is running on port ${info.port}`);
});

export { port };