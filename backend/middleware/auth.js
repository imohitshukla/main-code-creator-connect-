import jwt from 'jsonwebtoken';

const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set('userId', decoded.id);
    c.set('userRole', decoded.role);
    c.set('isAdmin', decoded.role === 'admin'); // Placeholder for admin role
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export { authMiddleware };
