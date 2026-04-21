// Simple in-memory rate limiter for Hono
const rateLimitMap = new Map();

export const rateLimit = (options = { windowMs: 15 * 60 * 1000, max: 5 }) => {
  return async (c, next) => {
    // Attempt to get IP from standard headers
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    
    // Bypass if IP is unknown (or you could strictly deny, but 'unknown' is safer for MVP)
    if (ip !== 'unknown') {
      const now = Date.now();
      const ipData = rateLimitMap.get(ip);
      
      if (!ipData) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
      } else {
        // If within window
        if (now - ipData.startTime < options.windowMs) {
          ipData.count++;
          if (ipData.count > options.max) {
            console.warn(`🚨 Rate limit exceeded for IP: ${ip}`);
            return c.json({ error: 'Too many requests, please try again later.' }, 429);
          }
        } else {
          // Reset window
          ipData.count = 1;
          ipData.startTime = now;
        }
      }
    }
    
    await next();
  };
};
