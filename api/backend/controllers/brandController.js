import { client } from '../config/database.js';

// Create brand profile
export const createBrandProfile = async (c) => {
  try {
    const userId = c.get('userId');
    
    // 🛡️ Layer 1: Defensive extraction with defaults
    const brandData = await c.req.json();
    const {
      company_name,
      industry_vertical,
      website_url,
      linkedin_page,
      company_size,
      hq_location,
      gst_tax_id,
      typical_budget_range,
      looking_for = [], // 🚨 DEFAULT: Never undefined
      description
    } = brandData;

    console.log('🔍 DEBUG: Creating brand profile for user:', userId);
    console.log('🔍 DEBUG: Brand data received:', brandData);

    // 🛡️ Layer 2: Bulletproof array validation
    let safeLookingFor = [];
    
    if (Array.isArray(looking_for)) {
      // Filter out any non-string values
      safeLookingFor = looking_for.filter(item => typeof item === 'string' && item.trim() !== '');
    } else if (looking_for === null || looking_for === undefined) {
      safeLookingFor = [];
    } else if (typeof looking_for === 'string') {
      // Handle case where it might be a JSON string
      try {
        const parsed = JSON.parse(looking_for);
        safeLookingFor = Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
      } catch {
        safeLookingFor = [];
      }
    } else {
      // Any other type, default to empty array
      safeLookingFor = [];
    }
    
    console.log('🔍 DEBUG: Safe looking_for array:', safeLookingFor);

    // Validate required fields
    const requiredFields = ['company_name', 'industry_vertical', 'website_url', 'company_size', 'hq_location', 'typical_budget_range'];
    const missingFields = requiredFields.filter(field => !brandData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return c.json({ 
        error: 'Missing required fields', 
        missing: missingFields 
      }, 400);
    }

    // Check if brand profile already exists
    const existingProfile = await client.query(
      'SELECT id FROM brand_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      console.log('❌ Brand profile already exists for user:', userId);
      return c.json({ error: 'Brand profile already exists' }, 409);
    }

    console.log('🔍 DEBUG: Inserting brand profile...');
    
    // Insert brand profile with bulletproof arrays
    const result = await client.query(`
      INSERT INTO brand_profiles (
        user_id, company_name, industry_vertical, website_url, linkedin_page,
        company_size, hq_location, gst_tax_id, typical_budget_range,
        looking_for, description, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING id
    `, [
      userId,
      company_name,
      industry_vertical,
      website_url,
      linkedin_page || null,
      company_size,
      hq_location,
      gst_tax_id || null,
      typical_budget_range,
      JSON.stringify(safeLookingFor), // 🛡️ Use bulletproof array
      description || null
    ]);

    console.log('✅ Brand profile created successfully with ID:', result.rows[0].id);

    return c.json({
      success: true,
      message: 'Brand profile created successfully',
      brandId: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Create brand profile error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      where: error.where,
      position: error.position
    });
    return c.json({ 
      error: 'Failed to create brand profile',
      details: error.message 
    }, 500);
  }
};

// Get brand profile
export const getBrandProfile = async (c) => {
  try {
    const userId = c.get('userId');

    const result = await client.query(`
      SELECT 
        bp.*,
        u.email,
        u.name as user_name
      FROM brand_profiles bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Brand profile not found' }, 404);
    }

    const profile = result.rows[0];
    
    // Parse JSON fields
    profile.looking_for = JSON.parse(profile.looking_for || '[]');

    return c.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get brand profile error:', error);
    return c.json({ 
      error: 'Failed to get brand profile' 
    }, 500);
  }
};

// Update brand profile
export const updateBrandProfile = async (c) => {
  try {
    const userId = c.get('userId');
    const updateData = await c.req.json();

    // Check if profile exists
    const existingProfile = await client.query(
      'SELECT id FROM brand_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      return c.json({ error: 'Brand profile not found' }, 404);
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key === 'looking_for') {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(JSON.stringify(updateData[key]));
      } else {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
      }
      paramIndex++;
    });

    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    const result = await client.query(`
      UPDATE brand_profiles 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING id
    `, updateValues);

    return c.json({
      success: true,
      message: 'Brand profile updated successfully',
      brandId: result.rows[0].id
    });

  } catch (error) {
    console.error('Update brand profile error:', error);
    return c.json({ 
      error: 'Failed to update brand profile' 
    }, 500);
  }
};
