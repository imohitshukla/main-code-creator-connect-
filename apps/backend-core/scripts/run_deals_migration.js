import { client } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        console.log('🚀 Starting Deals Table Migration...');

        // Read the SQL file
        const migrationPath = path.join(__dirname, '../migrations/002_create_deals_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log(`📄 Executing migration from: ${migrationPath}`);

        // Execute the SQL
        await client.query(sql);

        console.log('✅ specific Deals table migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
