import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import client from '../config/database.js';

export const registerCreator = async (c) => {
  const { name, email, password, portfolio_link } = c.req.valid('json');
  
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

    // Start transaction
    await client.query('BEGIN');

    // Create user
    const newUser = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'creator']
    );

    const userId = newUser.rows[0].id;

    // Create creator profile
    await client.query(
      `INSERT INTO creator_profiles (user_id, name, portfolio_links) 
       VALUES ($1, $2, $3)`,
      [userId, name, JSON.stringify([portfolio_link])]
    );

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'creator' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: userId, email, role: 'creator', name }
    }, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Register Brand
export const registerBrand = async (c) => {
  const { company_name, email, password, website } = c.req.valid('json');

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

    // Start transaction
    await client.query('BEGIN');

    // Create user
    const newUser = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'brand']
    );

    const userId = newUser.rows[0].id;

    // Create brand profile
    await client.query(
      `INSERT INTO brand_profiles (user_id, company_name, website)
       VALUES ($1, $2, $3)`,
      [userId, company_name, website]
    );

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'brand' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: userId, email, role: 'brand', company_name }
    }, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Login
export const login = async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Find user
    const userResult = await client.query(
      'SELECT id, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return c.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
