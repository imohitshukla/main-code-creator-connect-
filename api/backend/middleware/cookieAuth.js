import jwt from 'jsonwebtoken';

const cookieAuthMiddleware = async (c, next) => {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) {
    return c.json({ error: 'Unauthorized - No cookie found' }, 401);
  }

  // Parse cookies from header
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});

  const token = cookies.auth_token;
  
  if (!token) {
    return c.json({ error: 'Unauthorized - No auth token found' }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set('userId', decoded.id);
    c.set('userRole', decoded.role);
    c.set('isAdmin', decoded.role === 'admin');
    await next();
  } catch (error) {
    console.error('Cookie Auth Middleware Error:', error.message);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export { cookieAuthMiddleware };
