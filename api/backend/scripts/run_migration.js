import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { client } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting Crash-Proof Migration...');

  try {
    const migrationPath = path.join(__dirname, '../migrations/001_crash_proof_profiles.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Reading migration file:', migrationPath);

    // Connect to DB
    await client.connect();
    console.log('🔌 Connected to database.');

    // Run SQL
    await client.query(sql);
    console.log('✅ Migration executed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close connection
    await client.end();
    console.log('👋 Connection closed.');
  }
}

runMigration();
