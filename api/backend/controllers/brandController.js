
import { pool } from '../config/database.js';

export const createBrandProfile = async (c) => {
  try {
    const user = c.get('user'); // Got from authMiddleware
    // c.req.json() is async in Hono
    const { company_name, website, industry, company_size } = await c.req.json();

    // 1. Validation (Simple)
    if (!company_name || !industry) {
      return c.json({ error: 'Company Name and Industry are required' }, 400);
    }

    // 2. SQL Query: Upsert (Insert, or Update if exists)
    // We use ON CONFLICT (user_id) to prevent duplicate profiles for one user
    const query = `
      INSERT INTO brand_profiles (user_id, company_name, website, industry, company_size)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        company_name = EXCLUDED.company_name,
        website = EXCLUDED.website,
        industry = EXCLUDED.industry,
        company_size = EXCLUDED.company_size,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [user.id, company_name, website, industry, company_size];
    const result = await pool.query(query, values);

    // 3. Update the Role in Users table (Just to be safe)
    await pool.query(`UPDATE users SET role = 'BRAND' WHERE id = $1`, [user.id]);

    // 4. Return the Combined User Data
    // We send this back so the Frontend AuthContext updates immediately
    const updatedUser = {
      ...user,
      role: 'BRAND',
      brand_details: result.rows[0]
    };

    return c.json({
      success: true,
      message: 'Brand profile saved!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error creating brand profile:', error);
    return c.json({ error: 'Server error saving profile' }, 500);
  }
};

export const getBrandProfile = async (c) => {
  const user = c.get('user');
  // Need to import pool if using it here, but we imported it at top
  const result = await pool.query('SELECT * FROM brand_profiles WHERE user_id = $1', [user.id]);

  if (result.rows.length === 0) {
    return c.json({ profile: null });
  }
  return c.json({ profile: result.rows[0] });
};

// Keeping updateBrandProfile for compatibility/extensibility if needed, 
// but createBrandProfile handles updates via UPSERT now.
export const updateBrandProfile = async (c) => {
  return createBrandProfile(c);
};
