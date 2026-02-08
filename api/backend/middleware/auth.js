import jwt from 'jsonwebtoken';

const authMiddleware = async (c, next) => {
  let token;

  // 1. Check Authorization header
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  // 2. Check Cookie (auth_token)
  else {
    const { getCookie } = await import('hono/cookie');
    token = getCookie(c, 'auth_token');
  }

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set('userId', decoded.id);
    c.set('userRole', decoded.role);
    c.set('isAdmin', decoded.role === 'admin'); // Placeholder for admin role
    await next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export { authMiddleware };
