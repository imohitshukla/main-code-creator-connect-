import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from '../../routes/auth.js';
import userRoutes from '../../routes/users.js';
import creatorRoutes from '../../routes/creators.js';
import campaignRoutes from '../../routes/campaignRoutes.js';
import aiRoutes from './routes/ai.js';
import messageRoutes from '../../routes/messages.js';
import mediaKitRoutes from '../../routes/mediakits.js';
import educationRoutes from '../../routes/education.js';
import analyticsRoutes from '../../routes/analytics.js';
import paymentsRoutes from '../../routes/payments.js';
import adminRoutes from '../../routes/admin.js';
import contactRoutes from '../../routes/contact.js';
import dealRoutes from '../../routes/deals.js';
import brandRoutes from '../../routes/brands.js';
import uploadRoutes from '../../routes/uploadRoutes.js';

const app = new Hono();

// --- � PROPER HONO CORS CONFIGURATION ---
// Dynamic origin handling for maximum compatibility
app.use('*', cors({
  origin: (origin, c) => {
    // Allow any origin that requests access
    return origin || '*';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());
// -------------------------------------

// Middleware
app.use('*', logger());
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import mime from 'mime-types'; // Note: Or use simple extname checks

// Custom File Serving Endpoint to handle ephemeral disk access explicitly
app.get('/uploads/:filename', (c) => {
  const filename = c.req.param('filename');
  // Secure dynamic path from root config directory
  const filepath = path.join(process.cwd(), 'uploads', filename);

  if (!existsSync(filepath)) {
    return c.json({ error: 'Endpoint not found or file expired', details: 'Render ephemeral disk likely wiped the storage' }, 404);
  }

  try {
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.json') mimeType = 'application/json';

    const buffer = readFileSync(filepath);
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      }
    });
  } catch (err) {
    console.error('File serving error:', err);
    return c.json({ error: 'Failed to read file' }, 500);
  }
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
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
app.route('/api/deals', dealRoutes);
app.route('/api/brands', brandRoutes);
app.route('/api/upload', uploadRoutes);

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
