import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { csrf } from 'hono/csrf';
import { serve } from '@hono/node-server';

// ── Standard application routes ──────────────────────────────────────────────
import authRoutes         from './routes/auth.js';
import creatorRoutes      from './routes/creators.js';
import brandRoutes        from './routes/brands.js';
import campaignRoutes     from './routes/campaignRoutes.js';
import aiRoutes           from './routes/ai.js';           // backend-core AI routes
import messageRoutes      from './routes/messages.js';
import mediaKitRoutes     from './routes/mediakits.js';
import educationRoutes    from './routes/education.js';
import analyticsRoutes    from './routes/analytics.js';
import dashboardRoutes    from './routes/dashboard.js';
import paymentsRoutes     from './routes/payments.js';
import adminRoutes        from './routes/admin.js';
import contactRoutes      from './routes/contact.js';
import newsletterRoutes   from './routes/newsletter.js';
import notificationRoutes from './routes/notifications.js';
import welcomeRoutes      from './routes/welcome.js';
import testEmailRoutes    from './routes/testEmail.js';
import uploadRoutes       from './routes/uploadRoutes.js';
import cronRoutes         from './routes/cron.js';

// ── Database migrations ───────────────────────────────────────────────────────
import { migrateAdminTables }   from './db/migrations/migrate_admin_tables.js';
import { migrateAnalyticsCache } from './db/migrations/migrate_analytics_cache.js';

const app = new Hono();

const allowedOrigins = [
  'http://localhost:5173',                           // Vite dev server
  'http://localhost:8080',                           // Vite default fallback
  'http://localhost:3000',                           // React default
  'https://main-code-creator-connect.onrender.com', // Old Render URL (safety)
  'https://www.creatorconnect.tech',                 // Production domain
  'https://creatorconnect.tech',                     // Production domain (no www)
];

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use('*', cors({
  origin:         allowedOrigins,
  credentials:    true,
  allowMethods:   ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders:   ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle preflight OPTIONS to prevent 404/auth errors
app.options('*', cors());

// ── Global middleware ─────────────────────────────────────────────────────────
app.use('*', secureHeaders());
app.use('*', csrf({ origin: allowedOrigins }));
app.use('*', logger());

// ── Standard API routes ───────────────────────────────────────────────────────
app.route('/api/auth',          authRoutes);
app.route('/api/creators',      creatorRoutes);
app.route('/api/brands',        brandRoutes);
app.route('/api/campaigns',     campaignRoutes);
app.route('/api/ai',            aiRoutes);
app.route('/api/messages',      messageRoutes);
app.route('/api/mediakits',     mediaKitRoutes);
app.route('/api/education',     educationRoutes);
app.route('/api/analytics',     analyticsRoutes);
app.route('/api/payments',      paymentsRoutes);
app.route('/api/admin',         adminRoutes);
app.route('/api/contact',       contactRoutes);
app.route('/api/newsletter',    newsletterRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/dashboard',     dashboardRoutes);
app.route('/api/upload',        uploadRoutes);
app.route('/api/cron',          cronRoutes);
app.route('/api/welcome',       welcomeRoutes);
app.route('/api/test-email',    testEmailRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (c) =>
  c.json({ status: 'OK', message: 'CreatorConnect API is running', version: 'MONOREPO_V2' })
);
app.get('/api/brands-debug', (c) => c.text('Brands Debug OK'));

// ── Error handlers ────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Endpoint not found' }, 404));
app.onError((err, c) => {
  console.error('Unhandled Server Error:', err);
  return c.json({ error: 'Server crashed', message: err.message }, 500);
});

// ── Bootstrap: run migrations then start server ───────────────────────────────
const PORT = process.env.PORT || 5000;

migrateAdminTables()
  .then(() => migrateAnalyticsCache())
  .then(() => {
    serve({ fetch: app.fetch, port: PORT }, (info) => {
      console.log(`[backend-core] Server running on port ${info.port}`);
    });
  })
  .catch((err) => {
    console.error('[backend-core] Startup failed during migrations:', err);
    process.exit(1);
  });
