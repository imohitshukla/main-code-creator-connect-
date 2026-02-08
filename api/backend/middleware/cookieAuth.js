import jwt from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';

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
    return c.json({ error: 'Unauthorized - No auth token found' }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set('userId', decoded.id);
    c.set('userRole', decoded.role);
    c.set('isAdmin', decoded.role === 'admin');
    await next();
  } catch (error) {
    console.error('❌ Cookie Auth Middleware Error:', error.message);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export { cookieAuthMiddleware };
