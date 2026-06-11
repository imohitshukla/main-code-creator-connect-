import { client } from '../config/database.js';

const migrate = async () => {
    try {
        await client.connect();
        console.log('Connected to database...');

        // Add is_urgent column
        await client.query(`
      ALTER TABLE campaigns 
      ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;
    `);
        console.log('Added is_urgent column.');

        // Add is_featured column
        await client.query(`
      ALTER TABLE campaigns 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    `);
        console.log('Added is_featured column.');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
