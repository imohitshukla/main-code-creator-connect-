import { client } from '../config/database.js';

// Update user role
export const updateUserRole = async (c) => {
  try {
    const userId = c.get('userId');
    const { role } = await c.req.json();

    // Validate role
    if (!['BRAND', 'CREATOR'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be BRAND or CREATOR' }, 400);
    }

    // Update user role in database
    const result = await client.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      user: result.rows[0],
      message: `Role updated to ${role} successfully`
    });
  } catch (error) {
    console.error('Update role error:', error);
    return c.json({ error: 'Failed to update role' }, 500);
  }
};

// Get current user info
export const getCurrentUser = async (c) => {
  try {
    const userId = c.get('userId');

    const result = await client.query(
      'SELECT id, email, name, role, image, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
};
