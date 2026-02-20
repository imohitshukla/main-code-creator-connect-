import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { client } from './backend/config/database.js';

// Route Imports
import authRoutes from './backend/routes/auth.js';
import creatorRoutes from './backend/routes/creators.js';
import campaignRoutes from './backend/routes/campaignRoutes.js';
import aiRoutes from './backend/routes/ai.js';
import messageRoutes from './backend/routes/messages.js';
import mediaKitRoutes from './backend/routes/mediakits.js';
import educationRoutes from './backend/routes/education.js';
import analyticsRoutes from './backend/routes/analytics.js';
import paymentsRoutes from './backend/routes/payments.js';
import adminRoutes from './backend/routes/admin.js';
import contactRoutes from './backend/routes/contact.js';
import dealRoutes from './backend/routes/deals.js';
import dashboardRoutes from './backend/routes/dashboard.js';
import userRoutes from './backend/routes/users.js';
import brandRoutes from './backend/routes/brands.js';

const app = new Hono();
const port = process.env.PORT || 10000;
// 🔄 SERVER RESTART TRIGGER: Added upload routes debugging
console.log('🚀 Server starting... Upload routes registered at /api/upload');

// 🛡️ PROFESSIONAL: Add comprehensive request logging for debugging
app.use('*', async (c, next) => {
  const start = Date.now();
  const url = c.req.url;
  const method = c.req.method;

  console.log('🔍 DEBUG: === REQUEST START ===');
  console.log('🔍 DEBUG: Request URL:', url);
  console.log('🔍 DEBUG: Request method:', method);

  // 🛡️ LOG ALL HEADERS FOR DEBUGGING
  const allHeaders = {
    'cookie': c.req.header('Cookie'),
    'content-type': c.req.header('Content-Type'),
    'authorization': c.req.header('Authorization'),
    'user-agent': c.req.header('User-Agent'),
    'origin': c.req.header('Origin'),
    'referer': c.req.header('Referer'),
    'accept': c.req.header('Accept'),
    'accept-language': c.req.header('Accept-Language'),
    'accept-encoding': c.req.header('Accept-Encoding'),
    'connection': c.req.header('Connection'),
    'upgrade-insecure-requests': c.req.header('Upgrade-Insecure-Requests'),
    'sec-fetch-dest': c.req.header('Sec-Fetch-Dest'),
    'sec-fetch-mode': c.req.header('Sec-Fetch-Mode'),
    'sec-fetch-site': c.req.header('Sec-Fetch-Site'),
    'sec-fetch-user': c.req.header('Sec-Fetch-User'),
    'cache-control': c.req.header('Cache-Control'),
    'pragma': c.req.header('Pragma'),
  };

  console.log('🔍 DEBUG: Request headers:', allHeaders);

  // 🛡️ SPECIAL DEBUGGING FOR LOGIN REQUESTS
  if (url.includes('/api/auth/login')) {
    console.log('🔍 DEBUG: === LOGIN REQUEST DETECTED ===');
    console.log('🔍 DEBUG: This is a login request - will monitor cookie setting...');
  }

  // 🛡️ SPECIAL DEBUGGING FOR BRAND PROFILE REQUESTS
  if (url.includes('/api/brands/profile')) {
    console.log('🔍 DEBUG: === BRAND PROFILE REQUEST DETECTED ===');
    console.log('🔍 DEBUG: This is a brand profile request - checking for cookie...');
    if (!c.req.header('Cookie')) {
      console.log('❌ CRITICAL: No cookie header found in brand profile request');
      console.log('❌ This means login cookie was not set or not being sent');
    } else {
      console.log('✅ Cookie header found in brand profile request');
    }
  }

  await next();

  const duration = Date.now() - start;

  // 🛡️ LOG RESPONSE HEADERS FOR DEBUGGING
  const responseHeaders = {};
  for (const [key, value] of c.res.headers.entries()) {
    responseHeaders[key] = value;
  }

  console.log('🔍 DEBUG: Response headers set:', {
    'set-cookie': responseHeaders['set-cookie'] || null,
    'access-control-allow-credentials': responseHeaders['access-control-allow-credentials'],
    'access-control-allow-origin': responseHeaders['access-control-allow-origin'],
  });

  console.log(`🔍 DEBUG: === REQUEST END (${duration}ms) ===`);
});

// PILLAR 1: Strict CORS with Credentials
app.use('/*', cors({
  origin: [
    'https://www.creatorconnect.tech',
    'https://creatorconnect.tech',
    'https://api.creatorconnect.tech', // 🛡️ Include API domain itself
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  credentials: true, // 🛡️ CRITICAL: Allow credentials for cross-domain
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Expires', 'Pragma', 'Cache-Control'], // 🛡️ Explicitly allow Cookie header
  exposedHeaders: ['Set-Cookie'], // 🛡️ Expose cookie headers to frontend
}));

// 🛡️ PRODUCTION SAFETY: Ensure brand_profiles table exists on startup
const initializeDatabase = async () => {
  try {
    // Check if brand_profiles table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'brand_profiles'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      console.log('🚨 brand_profiles table missing - creating...');

      // Create table with all required columns
      await client.query(`
        CREATE TABLE brand_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          
          -- Company Identity
          company_name VARCHAR(255) NOT NULL,
          industry_vertical VARCHAR(50) CHECK (industry_vertical IN ('E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 'Finance', 'Travel', 'Food & Beverage', 'Other')),
          website_url VARCHAR(500),
          linkedin_page VARCHAR(500),
          
          -- Business Details
          company_size VARCHAR(50) CHECK (company_size IN ('Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)')),
          hq_location TEXT,
          gst_tax_id VARCHAR(100),
          
          -- Campaign Preferences
          typical_budget_range VARCHAR(50) CHECK (typical_budget_range IN ('₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+')),
          looking_for JSONB,
          
          -- Additional Info
          description TEXT,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes
      await client.query('CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);');
      await client.query('CREATE INDEX IF NOT EXISTS idx_brand_profiles_industry ON brand_profiles(industry_vertical);');
      await client.query('CREATE INDEX IF NOT EXISTS idx_brand_profiles_budget ON brand_profiles(typical_budget_range);');

      console.log('✅ brand_profiles table created successfully!');
    } else {
      console.log('✅ brand_profiles table already exists');
    }
  } catch (error) {
    console.error('❌ Table setup error:', error);
    // We might want to exit here if this is critical, but for now we'll just log
  }
};

// Middleware
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
app.route('/api/deals', dealRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/users', userRoutes);
app.route('/api/brands', brandRoutes);



// File Uploads
import uploadRoutes from './backend/routes/uploadRoutes.js';
app.route('/api/upload', uploadRoutes);

// Serve Static Files (Uploads)
import { serveStatic } from '@hono/node-server/serve-static';
app.use('/uploads/*', serveStatic({ root: './' }));

// Health check endpoint
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
// Start Server
initializeDatabase().then(() => {
  serve({
    fetch: app.fetch,
    port: port,
    hostname: '0.0.0.0'
  }, (info) => {
    console.log(`Server is running on port ${info.port}`);
  });
});

export { port };