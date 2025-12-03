import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from '../backend/routes/auth.js';
import creatorRoutes from '../backend/routes/creators.js';
import campaignRoutes from '../backend/routes/campaigns.js';
import aiRoutes from '../backend/src/backend/routes/ai.js';
import messageRoutes from '../backend/routes/messages.js';
import mediaKitRoutes from '../backend/routes/mediakits.js';
import educationRoutes from '../backend/routes/education.js';
import analyticsRoutes from '../backend/routes/analytics.js';
import paymentsRoutes from '../backend/routes/payments.js';
import adminRoutes from '../backend/routes/admin.js';
import contactRoutes from '../backend/routes/contact.js';

const app = new Hono();

// Configure CORS to allow your Vercel frontend
const corsOptions = {
  origin: [
    "https://main-code-creator-connect.vercel.app", // <--- THIS is the one you are using now
    "https://niche-connect-project.vercel.app",     // Keep this just in case
    "http://localhost:5173"                           // For local testing
  ],
  credentials: true
};

// Middleware
app.use('*', cors(corsOptions));
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

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', message: 'CreatorConnect API is running' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Global error handler for debugging
app.onError((err, c) => {
  console.error('Unhandled Server Error:', err);
  return c.json({ error: 'Server crashed', message: err.message }, 500);
});

const port = process.env.PORT || 10000;

import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`Server is running on port ${info.port}`);
});

export { port };
export const fetch = app.fetch;
