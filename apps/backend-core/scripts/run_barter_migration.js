import { client } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        console.log('🚀 Starting Barter Architecture Migration...');

        const migrationPath = path.join(__dirname, '../migrations/003_barter_architecture.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log(`📄 Executing migration from: ${migrationPath}`);

        await client.query(sql);

        console.log('✅ Barter Architecture migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
