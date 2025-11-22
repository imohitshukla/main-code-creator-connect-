import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from '../routes/auth.js';
import creatorRoutes from '../routes/creators.js';
import campaignRoutes from '../routes/campaigns.js';
import aiRoutes from '../src/backend/routes/ai.js';
import messageRoutes from '../routes/messages.js';
import mediaKitRoutes from '../routes/mediakits.js';
import educationRoutes from '../routes/education.js';
import analyticsRoutes from '../routes/analytics.js';
import paymentsRoutes from '../routes/payments.js';
import adminRoutes from '../routes/admin.js';
import contactRoutes from '../routes/contact.js';

const app = new Hono();

// Configure CORS to allow your Vercel frontend
const corsOptions = {
  origin: [
    'https://main-code-creator.vercel.app', // Your production frontend
    'http://localhost:3000',             // Your local frontend
    /https:\/\/main-code-creator-.*\.vercel\.app/ // All Vercel preview URLs
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

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Something went wrong!' }, 500);
});

// Make sure PORT is defined.
const PORT = process.env.PORT || 5000;

import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`);
});

export const port = PORT;
export const fetch = app.fetch;
