
import { Client } from 'pg';
import 'dotenv/config';

const fixDB = async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionString = process.env.DATABASE_URL;

    let clientConfig;

    if (connectionString) {
        clientConfig = {
            connectionString,
            ssl: isProduction || connectionString.includes('render.com')
                ? { rejectUnauthorized: false }
                : false,
        };
    } else {
        clientConfig = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: isProduction || (process.env.DB_HOST && process.env.DB_HOST.includes('render'))
                ? { rejectUnauthorized: false }
                : false,
        };
    }

    const client = new Client(clientConfig);

    try {
        await client.connect();
        console.log('Connected to database...');

        console.log('Creating contact_submissions table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Table contact_submissions created (or already existed).');

    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        await client.end();
    }
};

fixDB();
