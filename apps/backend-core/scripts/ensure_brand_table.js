import { client } from '../config/database.js';

async function ensureBrandTable() {
  try {
    console.log('🚀 Ensuring brand_profiles table exists...');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'brand_profiles'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📋 Table exists check:', tableExists);
    
    if (!tableExists) {
      console.log('🔧 Creating brand_profiles table...');
      
      // Create table with all required columns
      await client.query(`
        CREATE TABLE brand_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          
          -- Company Identity
          company_name VARCHAR(255) NOT NULL,
          industry_vertical VARCHAR(50) CHECK (industry_vertical IN ('E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 'Finance', 'Travel', 'Food & Beverage', 'Other')),
          website_url VARCHAR(500),
          linkedin_page VARCHAR(500),
          
          -- Business Details
          company_size VARCHAR(50) CHECK (company_size IN ('Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)')),
          hq_location TEXT,
          gst_tax_id VARCHAR(100),
          
          -- Campaign Preferences
          typical_budget_range VARCHAR(50) CHECK (typical_budget_range IN ('₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+')),
          looking_for JSONB,
          
          -- Additional Info
          description TEXT,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Brand profiles table created successfully!');
      
      // Create indexes
      await client.query('CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);');
      await client.query('CREATE INDEX IF NOT EXISTS idx_brand_profiles_industry ON brand_profiles(industry_vertical);');
      await client.query('CREATE INDEX IF NOT EXISTS idx_brand_profiles_budget ON brand_profiles(typical_budget_range);');
      
      console.log('✅ Indexes created successfully!');
      
    } else {
      console.log('✅ Brand profiles table already exists');
      
      // Check for missing columns and add them
      const columnCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'brand_profiles' 
        ORDER BY ordinal_position
      `);
      
      const existingColumns = columnCheck.rows.map(row => row.column_name);
      console.log('📋 Existing columns:', existingColumns);
      
      // Add missing columns if needed
      const requiredColumns = [
        { name: 'linkedin_page', type: 'VARCHAR(500)' },
        { name: 'company_size', type: 'VARCHAR(50)' },
        { name: 'hq_location', type: 'TEXT' },
        { name: 'gst_tax_id', type: 'VARCHAR(100)' },
        { name: 'typical_budget_range', type: 'VARCHAR(50)' },
        { name: 'looking_for', type: 'JSONB' }
      ];
      
      for (const column of requiredColumns) {
        if (!existingColumns.includes(column.name)) {
          console.log(`🔧 Adding missing column: ${column.name}`);
          await client.query(`ALTER TABLE brand_profiles ADD COLUMN ${column.name} ${column.type};`);
        }
      }
      
      // Add unique constraint if missing
      try {
        await client.query('ALTER TABLE brand_profiles ADD CONSTRAINT brand_profiles_user_id_unique UNIQUE (user_id);');
        console.log('✅ Unique constraint added');
      } catch (error) {
        if (error.code !== '23505') { // Not a duplicate constraint error
          console.log('⚠️ Constraint error:', error.message);
        }
      }
    }
    
    // Verify final table structure
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'brand_profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Final brand_profiles table structure:');
    console.table(finalCheck.rows);
    
    console.log('✅ Brand profiles table verification complete!');
    
  } catch (error) {
    console.error('❌ Brand table setup error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the setup
ensureBrandTable().catch(console.error);
