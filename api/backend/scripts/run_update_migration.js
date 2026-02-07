import fs from 'fs';
import path from 'path';
import { client } from '../config/database.js';

async function runUpdateMigration() {
  try {
    console.log('🚀 Updating brand_profiles table structure...');
    
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'backend/scripts/migration_update_brand_profiles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Brand profiles table updated successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
runUpdateMigration().catch(console.error);
