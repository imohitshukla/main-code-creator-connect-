import jwt from 'jsonwebtoken';

const cookieAuthMiddleware = async (c, next) => {
  // Debug: Log all headers for troubleshooting
  const allHeaders = Object.fromEntries(c.req.header());
  console.log('🔍 DEBUG: Request headers:', allHeaders);
  
  const cookieHeader = c.req.header('Cookie');
  console.log('🔍 DEBUG: Cookie header:', cookieHeader);
  
  if (!cookieHeader) {
    console.log('❌ No cookie header found');
    return c.json({ error: 'Unauthorized - No cookie found' }, 401);
  }

  // Parse cookies from header
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});

  console.log('🔍 DEBUG: Parsed cookies:', cookies);
  const token = cookies.auth_token;
  
  if (!token) {
    console.log('❌ No auth_token cookie found');
    return c.json({ error: 'Unauthorized - No auth token found' }, 401);
  }

  try {
    console.log('🔍 DEBUG: Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 DEBUG: JWT decoded successfully:', { userId: decoded.id, role: decoded.role });
    
    c.set('userId', decoded.id);
    c.set('userRole', decoded.role);
    c.set('isAdmin', decoded.role === 'admin');
    await next();
  } catch (error) {
    console.error('❌ Cookie Auth Middleware Error:', error.message);
    console.log('🔍 DEBUG: Token that failed:', token.substring(0, 20) + '...');
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export { cookieAuthMiddleware };
