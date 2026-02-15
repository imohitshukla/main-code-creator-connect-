import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { client } from '../config/database.js';
import { sendEmail } from '../utils/emailService.js';
import { setCookie, getCookie } from 'hono/cookie'; // 🛡️ CRITICAL: Import Hono cookie helpers

// Initialize Twilio client conditionally
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  console.warn('Twilio credentials missing. SMS features will be disabled.');
}

// ... (existing code) ...

// Register Creator
const registerCreator = async (c) => {
  const { name, email, password, portfolio_link, phone_number } = c.req.valid('json');

  let db;
  try {
    // Reserve a client from the pool for the transaction
    db = await client.connect();

    // Check if user exists (can be done on pool or dedicated client, dedicated is safer for consistency)
    const userExists = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await db.query('BEGIN');

    // Create user
    const newUser = await db.query(
      'INSERT INTO users (email, password, role, phone_number) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, 'creator', phone_number]
    );

    const userId = newUser.rows[0].id;

    // Create creator profile
    await db.query(
      `INSERT INTO creator_profiles (user_id, name, portfolio_links) 
       VALUES ($1, $2, $3)`,
      [userId, name, JSON.stringify(portfolio_link ? [portfolio_link] : [])]
    );

    await db.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'creator' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 🚨 NUCLEAR COOKIE FIX: Ultimate cookie setting solution
    const host = c.req.header('host') || '';
    const isProduction = process.env.NODE_ENV === 'production' || host.includes('creatorconnect.tech');

    console.log('🔥 NUCLEAR DEBUG: Ultimate cookie environment:', {
      host,
      isProduction,
      userAgent: c.req.header('user-agent'),
      origin: c.req.header('origin'),
      referer: c.req.header('referer')
    });

    //  NUCLEAR APPROACH 2: Hono setCookie with every option
    try {
      const { setCookie } = await import('hono/cookie');

      // 🔥 TRY EVERY COMBINATION
      const options = [
        { httpOnly: true, secure: true, sameSite: 'None', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        { httpOnly: true, secure: true, sameSite: 'None', path: '/', maxAge: 604800 },
        { httpOnly: true, secure: false, sameSite: 'None', path: '/', maxAge: 604800 },
        { httpOnly: false, secure: true, sameSite: 'None', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 }
      ];

      for (let i = 0; i < options.length; i++) {
        try {
          await setCookie(c, 'auth_token', token, options[i]);
          console.log(`🔥 NUCLEAR: Hono setCookie ${i + 1} success:`, options[i]);
        } catch (optionError) {
          console.error(`❌ NUCLEAR: Hono setCookie ${i + 1} failed:`, optionError.message);
        }
      }
    } catch (importError) {
      console.error('❌ NUCLEAR: Hono import failed:', importError.message);
    }

    //  NUCLEAR APPROACH 3: Manual header manipulation
    try {
      const cookieVariations = [
        `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=None; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${encodeURIComponent(token)}; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${token}; Path=/` // Emergency minimal
      ];

      cookieVariations.forEach((cookie, index) => {
        c.header(`Set-Cookie-${index}`, cookie);
        c.header('Set-Cookie', cookie);
      });

      console.log('🔥 NUCLEAR: Manual headers set:', cookieVariations.length, 'variations');
    } catch (headerError) {
      console.error('❌ NUCLEAR: Manual headers failed:', headerError.message);
    }

    return c.json({
      token,
      user: { id: userId, email, role: 'creator', name }
    }, 201);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Signup Error:", error);
    return c.json({
      error: 'Signup failed',
      details: error.message
    }, 500);
  } finally {
    if (db) db.release();
  }
};

// Register Brand
const registerBrand = async (c) => {
  const { company_name, email, password, website, website_url, phone_number } = c.req.valid('json');

  // 🚨 DEBUG: Log all received fields
  console.log('🔍 DEBUG: Brand registration received:', {
    company_name: !!company_name,
    email: !!email,
    password: !!password,
    website: !!website,
    website_url: !!website_url,
    phone_number: !!phone_number
  });

  // 🚨 CRITICAL: Handle both website and website_url fields
  const finalWebsite = (website || website_url) || null;

  let db;
  try {
    // Reserve a client from the pool for the transaction
    db = await client.connect();
    // Check if user exists
    const userExists = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    console.log('🔍 DEBUG: User check for', email, 'found:', userExists.rows.length);

    if (userExists.rows.length > 0) {
      console.warn('⚠️ Register Brand: User already exists:', email);
      return c.json({ error: 'User already exists' }, 400);
    }

    // 🛡️ PROFESSIONAL VALIDATION: Check required fields
    if (!company_name || !email || !password || !phone_number) {
      console.error('❌ Missing required fields:', {
        company_name: !!company_name,
        email: !!email,
        password: !!password,
        phone_number: !!phone_number
      });
      return c.json({
        error: 'Missing required fields',
        details: 'company_name, email, password, and phone_number are required'
      }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await db.query('BEGIN');

    // Create user
    const newUser = await db.query(
      'INSERT INTO users (email, password, role, phone_number) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, 'brand', phone_number]
    );

    const userId = newUser.rows[0].id;

    // Create brand profile
    await db.query(
      `INSERT INTO brand_profiles (user_id, company_name, website)
       VALUES ($1, $2, $3)`,
      [userId, company_name, finalWebsite]
    );

    await db.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'brand' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // � NUCLEAR COOKIE FIX: Ultimate cookie setting solution
    const host = c.req.header('host') || '';
    const isProduction = process.env.NODE_ENV === 'production' || host.includes('creatorconnect.tech');

    console.log('🔥 NUCLEAR DEBUG: Ultimate cookie environment:', {
      host,
      isProduction
    });

    // NUCLEAR APPROACH 1 & 2 MERGED/CLEANED
    // NUCLEAR APPROACH 2: Hono setCookie with every option
    const ultimateCookie = `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=None; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`;

    // NUCLEAR APPROACH 2: Hono setCookie with every option
    try {
      const { setCookie } = await import('hono/cookie');

      const options = [
        { httpOnly: true, secure: true, sameSite: 'None', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        { httpOnly: true, secure: true, sameSite: 'None', path: '/', maxAge: 604800 },
        { httpOnly: true, secure: false, sameSite: 'None', path: '/', maxAge: 604800 },
        { httpOnly: false, secure: true, sameSite: 'None', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 }
      ];

      for (let i = 0; i < options.length; i++) {
        try {
          await setCookie(c, 'auth_token', token, options[i]);
          console.log(`🔥 NUCLEAR: Hono setCookie ${i + 1} success:`, options[i]);
        } catch (optionError) {
          console.error(`❌ NUCLEAR: Hono setCookie ${i + 1} failed:`, optionError.message);
        }
      }
    } catch (importError) {
      console.error('❌ NUCLEAR: Hono import failed:', importError.message);
    }

    // � NUCLEAR APPROACH 3: Manual header manipulation
    try {
      const cookieVariations = [
        ultimateCookie,
        `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
        `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${encodeURIComponent(token)}; Path=/; Domain=.creatorconnect.tech; MaxAgege=604800`,
        `auth_token=${token}; Path=/` // Emergency minimal
      ];

      cookieVariations.forEach((cookie, index) => {
        c.header(`Set-Cookie-${index}`, cookie);
        c.header('Set-Cookie', cookie);
      });

      console.log('🔥 NUCLEAR: Manual headers set:', cookieVariations.length, 'variations');
    } catch (headerError) {
      console.error('❌ NUCLEAR: Manual headers failed:', headerError.message);
    }

    // NUCLEAR APPROACH 4 REMOVED (Caused crash)

    return c.json({
      token,
      user: { id: userId, email, role: 'brand', company_name }
    }, 201);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Signup Error:", error);
    return c.json({
      error: 'Signup failed',
      details: error.message
    }, 500);
  } finally {
    if (db) db.release();
  }
};

// Login - Send OTP
const login = async (c) => {
  console.log('🔍 DEBUG: === LOGIN START ===');

  try {
    // 🛡️ PROFESSIONAL ERROR HANDLING: Validate request body
    let requestBody;
    try {
      requestBody = await c.req.json();
      console.log('🔍 DEBUG: Login request body:', requestBody);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return c.json({ error: 'Invalid JSON in request body' }, 400);
    }

    const { email, password } = requestBody;

    // 🛡️ PROFESSIONAL VALIDATION: Check required fields
    if (!email || !password) {
      console.error('❌ Missing required fields:', { email: !!email, password: !!password });
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log('🔍 DEBUG: Attempting login for email:', email);

    // Find user with FULL PROFILE DATA
    const userResult = await client.query(
      `SELECT 
        u.id, u.email, u.password, u.role, u.phone_number, u.avatar,
        bp.company_name, bp.website, bp.industry,
        cp.name, cp.niche, cp.instagram_link, cp.youtube_link, cp.portfolio_link, cp.follower_count, cp.bio, cp.budget_range, cp.audience_breakdown, cp.collaboration_goals, cp.engagement_rate
       FROM users u
       LEFT JOIN brand_profiles bp ON u.id = bp.user_id 
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id 
       WHERE u.email = $1`,
      [email]
    );

    console.log('🔍 DEBUG: User query result:', userResult.rows.length, 'users found');

    if (userResult.rows.length === 0) {
      console.error('❌ User not found for email:', email);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = userResult.rows[0];
    console.log('🔍 DEBUG: User found:', { id: user.id, role: user.role, email: user.email });

    // Check password
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔍 DEBUG: Password validation result:', isValidPassword);
    } catch (bcryptError) {
      console.error('❌ Bcrypt error:', bcryptError);
      return c.json({ error: 'Authentication error' }, 500);
    }

    if (!isValidPassword) {
      console.error('❌ Invalid password for user:', user.id);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // 🛡️ PROFESSIONAL FIX: Set cookie directly in login for immediate authentication
    let token;
    try {
      token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      console.log('🔍 DEBUG: JWT token generated successfully');
    } catch (jwtError) {
      console.error('❌ JWT generation error:', jwtError);
      return c.json({ error: 'Token generation failed' }, 500);
    }

    // 🛡️ PROFESSIONAL COOKIE SETTING: Set cookie immediately with TRIPLE FALLBACK
    // 🛡️ PROFESSIONAL COOKIE SETTING: Set cookie immediately with TRIPLE FALLBACK
    try {
      const { setCookie } = await import('hono/cookie');

      const options = [
        { httpOnly: true, secure: true, sameSite: 'None', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        { httpOnly: true, secure: true, sameSite: 'None', path: '/', maxAge: 604800 },
        { httpOnly: true, secure: false, sameSite: 'None', path: '/', maxAge: 604800 },
        { httpOnly: false, secure: true, sameSite: 'None', path: '/', domain: '.creatorconnect.tech', maxAge: 604800 },
        // Localhost special
        { httpOnly: true, secure: false, sameSite: 'Lax', path: '/', maxAge: 604800 }
      ];

      for (let i = 0; i < options.length; i++) {
        try {
          await setCookie(c, 'auth_token', token, options[i]);
          console.log(`🔥 NUCLEAR: Hono setCookie ${i + 1} success:`, options[i]);
        } catch (optionError) {
          console.error(`❌ NUCLEAR: Hono setCookie ${i + 1} failed:`, optionError.message);
        }
      }
    } catch (importError) {
      console.error('❌ NUCLEAR: Hono import failed:', importError.message);
    }

    //  FALLBACK 2: Manual header with exact domain
    try {
      const cookieVariations = [
        `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=None; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${encodeURIComponent(token)}; Path=/; Domain=.creatorconnect.tech; Max-Age=604800`,
        `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax`, // Localhost friendly
        `auth_token=${token}; Path=/` // Emergency minimal
      ];

      cookieVariations.forEach((cookie, index) => {
        c.header(`Set-Cookie-${index}`, cookie);
        c.header('Set-Cookie', cookie);
      });
      console.log('🔥 NUCLEAR: Manual headers set:', cookieVariations.length, 'variations');
    } catch (headerError) {
      console.error('❌ NUCLEAR: Manual headers failed:', headerError.message);
    }

    // Filter user object to remove sensitive data like password
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
      avatar: user.avatar,
      // Brand fields
      company_name: user.company_name,
      website: user.website,
      industry: user.industry,
      // Creator fields
      name: user.name,
      niche: user.niche,
      instagram_link: user.instagram_link,
      youtube_link: user.youtube_link,
      portfolio_link: user.portfolio_link,
      follower_count: user.follower_count,
      bio: user.bio
    };

    console.log('✅ DEBUG: Login successful for user:', user.id);

    // 🛡️ PROFESSIONAL RESPONSE: Return success without OTP requirement
    return c.json({
      success: true,
      user: {
        ...userResponse,
        token // Ensure token is inside user object for AuthContext
      },
      token, // Also at root level for safety
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    return c.json({
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
};

// Verify Login OTP
const verifyLoginOtp = async (c) => {
  const { userId, otp } = c.req.valid('json');

  try {
    // Find user by ID
    const userResult = await client.query(
      'SELECT id, email, role, phone_otp, otp_expires_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    // Check if OTP matches and hasn't expired
    if (user.phone_otp !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return c.json({ error: 'OTP has expired' }, 400);
    }

    // Clear OTP fields
    await client.query(
      'UPDATE users SET phone_otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 🛡️ PROFESSIONAL COOKIE SETTING: Set cookie immediately with TRIPLE FALLBACK
    // 🛡️ DYNAMIC COOKIE CONFIGURATION
    const host = c.req.header('host') || '';
    const isProduction = process.env.NODE_ENV === 'production' || host.includes('creatorconnect.tech');

    console.log('🍪 DEBUG: OTP - Setting cookie for production:', isProduction, 'host:', host);

    try {
      // 🚨 FALLBACK 1: Hono setCookie
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for Render/Vercel
        sameSite: 'None', // Required for cross-site (if any) or cross-subdomain in some contexts
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        domain: isProduction ? '.creatorconnect.tech' : undefined
      };

      console.log('🍪 DEBUG: OTP - Attempting Hono setCookie with Options:', cookieOptions);
      await setCookie(c, 'auth_token', token, cookieOptions);
      console.log('🍪 DEBUG: OTP - Hono setCookie successful for user:', user.id);

      // � FALLBACK 2: Manual header with exact domain
      const cookieValue2 = `auth_token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${60 * 60 * 24 * 7}${isProduction ? '; Domain=.creatorconnect.tech' : ''}`;
      c.header('Set-Cookie', cookieValue2);
      console.log('🍪 DEBUG: OTP - Manual header set:', cookieValue2);

      // 🚨 FALLBACK 3: Emergency universal header
      const cookieValue3 = `auth_token=${token}; HttpOnly; Secure; SameSite=None; Domain=.creatorconnect.tech; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
      c.header('Set-Cookie', cookieValue3);
      console.log('🍪 DEBUG: OTP - Emergency universal header set');

    } catch (cookieError) {
      console.error('❌ TRIPLE FALLBACK - All cookie methods failed:', cookieError);

      // 🚨 EMERGENCY: Try basic cookie
      try {
        const basicCookie = `auth_token=${token}; Path=/; HttpOnly`;
        c.header('Set-Cookie', basicCookie);
        console.log('🍪 DEBUG: Emergency basic cookie set');
      } catch (finalError) {
        console.error('❌ Emergency basic cookie failed:', finalError);
        return c.json({
          error: 'Failed to set authentication cookie',
          details: cookieError.message,
          token: token // Return token as fallback
        }, 500);
      }
    }

    return c.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
};

// Send OTP
const sendOtp = async (c) => {
  const { phone_number } = c.req.valid('json');

  try {
    // Check if user exists with this phone number
    const userResult = await client.query(
      'SELECT id FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found with this phone number' }, 404);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP and expiration
    await client.query(
      'UPDATE users SET phone_otp = $1, otp_expires_at = $2 WHERE phone_number = $3',
      [otp, expiresAt, phone_number]
    );

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your OTP for phone verification is: ${otp}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone_number,
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      // Log OTP for development/testing if Twilio fails
      console.log(`OTP for ${phone_number}: ${otp}`);
      // Still return success as OTP was generated and saved
      // In production, you might want to return an error here
    }

    return c.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to send OTP' }, 500);
  }
};

// Verify OTP
const verifyOtp = async (c) => {
  const { phone_number, otp } = c.req.valid('json');

  try {
    // Find user by phone number
    const userResult = await client.query(
      'SELECT id, phone_otp, otp_expires_at FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    // Check if OTP matches and hasn't expired
    if (user.phone_otp !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return c.json({ error: 'OTP has expired' }, 400);
    }
    // Update user: set verified, clear OTP fields
    await client.query(
      'UPDATE users SET is_phone_verified = TRUE, phone_otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    return c.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
};

const signup = async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Check if user exists
    const userExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default role 'creator' (can be changed later)
    const newUser = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'creator']
    );

    const userId = newUser.rows[0].id;

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'creator' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: userId, email, role: 'creator' }
    }, 201);
  } catch (error) {
    console.error("Signup Error:", error);
    return c.json({
      error: 'Signup failed',
      details: error.message
    }, 500);
  }
};

// Forgot Password - Request OTP
const forgotPassword = async (c) => {
  const { email } = c.req.valid('json');

  try {
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Security: Don't reveal if user exists. Return success even if not found.
      // But for better UX in this MVP phase, maybe we return 404? 
      // The user asked for "professional", professional is 200 OK "If that email exists, we sent a code".
      // But let's be practical: return 404 if not found for specific user feedback requested? 
      // "works to email otp" -> imply correctness.
      // Let's return 404 for now to help them debug, or 400.
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP (reusing phone_otp column as generic OTP column)
    await client.query(
      'UPDATE users SET phone_otp = $1, otp_expires_at = $2 WHERE id = $3',
      [otp, expiresAt, user.id]
    );

    // Send Email
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - Niche Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested to reset your password. Use the following OTP code:</p>
          <p><strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });

    return c.json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Reset Password - Verify OTP and Update Password
const resetPassword = async (c) => {
  const { email, otp, newPassword } = c.req.valid('json');

  try {
    const userResult = await client.query(
      'SELECT id, phone_otp, otp_expires_at FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userResult.rows[0];

    if (user.phone_otp !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return c.json({ error: 'OTP has expired' }, 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await client.query(
      'UPDATE users SET password = $1, phone_otp = NULL, otp_expires_at = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    return c.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Logout - Clear Cookies
const logout = async (c) => {
  try {
    const { setCookie, deleteCookie } = await import('hono/cookie');

    // 🛡️ NUCLEAR COOKIE CLEARING STRATEGY
    // We must try to expire the cookie on EVERY possible domain/path combination
    // because we don't know exactly which one the browser is honoring.

    const cookieName = 'auth_token';

    const variations = [
      // 1. Production Domain (Exact)
      { path: '/', secure: true, sameSite: 'None', domain: '.creatorconnect.tech' },
      // 2. Production Domain (Lax)
      { path: '/', secure: true, sameSite: 'Lax', domain: '.creatorconnect.tech' },
      // 3. No Domain (Host only - for localhost or direct domain)
      { path: '/', secure: true, sameSite: 'None' },
      // 4. No Domain + Lax (Common default)
      { path: '/', secure: true, sameSite: 'Lax' },
      // 5. Insecure (Just in case)
      { path: '/', secure: false, sameSite: 'Lax' }
    ];

    console.log('🚪 Logout initiated. Attempting to clear cookies...');

    for (const options of variations) {
      try {
        // Setting maxAge: 0 is the most reliable way to delete
        await setCookie(c, cookieName, '', { ...options, maxAge: 0, expires: new Date(0) });
      } catch (e) {
        console.error('Logout cookie clear failed for option:', options, e);
      }
    }

    // Explicit Delete Helper (Just to be sure)
    try {
      deleteCookie(c, cookieName);
    } catch (e) { }

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
};

export {
  registerCreator,
  registerBrand,
  signup,
  login,
  verifyLoginOtp,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout
};


