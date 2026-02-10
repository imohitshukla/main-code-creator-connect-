import jwt from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';
import { client } from '../config/database.js';

const cookieAuthMiddleware = async (c, next) => {
  // Debug: Log all headers for troubleshooting
  const allHeaders = {
    'cookie': c.req.header('Cookie'),
    'content-type': c.req.header('Content-Type'),
    'authorization': c.req.header('Authorization'),
    'user-agent': c.req.header('User-Agent'),
    'origin': c.req.header('Origin')
  };
  console.log('🔍 DEBUG: Request headers:', allHeaders);

  // 1. Try to get token from Cookie
  let token = getCookie(c, 'auth_token');
  console.log('🔍 DEBUG: Cookie auth_token:', token ? 'Found' : 'Not Found');

  // 2. Fallback: Try Authorization header
  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('🔍 DEBUG: Found token in Authorization header');
    }
  }

  if (!token) {
    console.log('❌ No auth token found in Cookie or Header');
    // Don't return 401 for /me endpoint, just continue without user
    if (c.req.path === '/api/auth/me') {
      await next();
      return;
    }
    return c.json({ error: 'Unauthorized - No auth token found' }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🚨 CRITICAL: Fetch full user from database and set in context
    const userResult = await client.query(
      'SELECT id, email, role, name, username, avatar, company_name, phone_number, portfolio_link FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return c.json({ error: 'User not found' }, 401);
    }
    
    const user = userResult.rows[0];
    console.log('🔍 DEBUG: User found:', user);
    
    // Set full user object in context
    c.set('user', user);
    c.set('userId', user.id);
    c.set('userRole', user.role);
    c.set('isAdmin', user.role === 'admin');
    
    await next();
  } catch (error) {
    console.error('❌ Cookie Auth Middleware Error:', error.message);
    // Don't return 401 for /me endpoint, just continue without user
    if (c.req.path === '/api/auth/me') {
      await next();
      return;
    }
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export { cookieAuthMiddleware };
