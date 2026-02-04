import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './routes/auth.js';
import creatorRoutes from './routes/creators.js';
import campaignRoutes from './routes/campaigns.js';
import aiRoutes from './src/backend/routes/ai.js';
import messageRoutes from './routes/messages.js';
import mediaKitRoutes from './routes/mediakits.js';
import educationRoutes from './routes/education.js';
import analyticsRoutes from './routes/analytics.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import welcomeRoutes from './src/backend/routes/welcome.js';
import testEmailRoutes from './src/backend/routes/testEmail.js';

const app = new Hono();

// Configure CORS to allow your Vercel frontend
const corsOptions = {
  origin: [
    "https://creatorconnect.tech",
    "https://www.creatorconnect.tech",
    "https://main-code-creator-connect.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
};

app.use('*', cors(corsOptions));
app.use('*', logger());
import { serveStatic } from '@hono/node-server/serve-static';

// Serve uploaded files statically
app.use('/uploads/*', serveStatic({
  // IMPORTANT: this backend runs with CWD already at "/backend"
  // so uploaded files live at "./uploads", not "./backend/uploads".
  root: './',
  rewriteRequestPath: (path) => path
}));

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
app.route('/api/newsletter', newsletterRoutes);

// Add the new welcome route
app.route('/api/welcome', welcomeRoutes);
app.route('/api/test-email', testEmailRoutes);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', message: 'CreatorConnect API is running' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled Server Error:', err);
  return c.json({ error: 'Server crashed', message: err.message }, 500);
});

const PORT = process.env.PORT || 5000;

import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`);
});
