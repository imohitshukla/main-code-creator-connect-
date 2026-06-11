import jwt from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';
import { client } from '../config/database.js';

const authMiddleware = async (c, next) => {
  try {
    let token;

    // 🕵️♂️ VECTOR 1: Check the Cookie (The Secure Way)
    const cookieToken = getCookie(c, 'auth_token');

    // 🕵️♂️ VECTOR 2: Check the Header (The Fail-Safe Way)
    const authHeader = c.req.header('Authorization');

    if (cookieToken) {
      token = cookieToken;
      console.log('🍪 AUTH: Token found in cookie');
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('🛡️ AUTH: Token found in header (fail-safe activated)');
    }

    if (!token) {
      console.log('❌ Auth Failed: No token in Cookie OR Header');
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    // 🔓 Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 FETCH FULL USER FROM DB (Crucial for avatar, updated roles, etc.)
    const userResult = await client.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Auth Failed: User not found in DB');
      return c.json({ error: 'Unauthorized - User not found' }, 401);
    }

    const user = userResult.rows[0];

    c.set('userId', user.id);
    c.set('userRole', user.role);
    c.set('user', user); // Set full user object
    c.set('isAdmin', user.role.toLowerCase() === 'admin');
    console.log('✅ AUTH: Token verified for user:', user.email);
    await next();

  } catch (error) {
    console.error('🔒 Auth Error:', error.message);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};

const requireRole = (role) => async (c, next) => {
  const userRole = c.get('userRole');
  if (!userRole || userRole.toUpperCase() !== role.toUpperCase()) {
    return c.json({ error: 'Forbidden - Insufficient permissions' }, 403);
  }
  await next();
};

export { authMiddleware, requireRole };
