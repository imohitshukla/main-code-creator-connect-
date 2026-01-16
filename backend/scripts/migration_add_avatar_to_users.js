
import { Client } from 'pg';
import 'dotenv/config';

const migrate = async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionString = process.env.DATABASE_URL;

    let clientConfig;
    if (connectionString) {
        clientConfig = {
            connectionString,
            ssl: isProduction || connectionString.includes('render.com') || connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
        };
    } else {
        clientConfig = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: isProduction || (process.env.DB_HOST && process.env.DB_HOST.includes('render')) ? { rejectUnauthorized: false } : false,
        };
    }

    const client = new Client(clientConfig);

    try {
        await client.connect();
        console.log('Connected to database...');

        console.log('Adding avatar column to users table if not exists...');
        await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'avatar'
        ) THEN
          ALTER TABLE users ADD COLUMN avatar TEXT;
        END IF;
      END $$;
    `);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.end();
    }
};

migrate();
