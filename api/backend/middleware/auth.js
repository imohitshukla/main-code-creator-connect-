import jwt from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';

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
    c.set('userId', decoded.id);
    c.set('userRole', decoded.role);
    c.set('user', decoded); // Set full user object if needed, or at least consistent with expectation
    c.set('isAdmin', decoded.role === 'admin');
    console.log('✅ AUTH: Token verified successfully for user:', decoded.id);
    await next();

  } catch (error) {
    console.error('🔒 Auth Error:', error.message);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};

export { authMiddleware };
