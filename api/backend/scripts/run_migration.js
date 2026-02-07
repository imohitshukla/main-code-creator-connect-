import fs from 'fs';
import path from 'path';
import { client } from '../config/database.js';

async function runMigration() {
  try {
    console.log('🚀 Running brand_profiles migration...');
    
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'backend/scripts/migration_create_brand_profiles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Brand profiles table created successfully!');
    
    // Verify the table was created
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'brand_profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Brand profiles table structure:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration().catch(console.error);
