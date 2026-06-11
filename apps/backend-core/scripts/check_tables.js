
import { Client } from 'pg';
import 'dotenv/config';

const checkDB = async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionString = process.env.DATABASE_URL;

    const client = new Client({
        connectionString,
        ssl: isProduction || connectionString.includes('render.com') ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');");
        console.log('Users table exists:', res.rows[0].exists);
    } catch (err) {
        console.error('Connection error', err);
    } finally {
        await client.end();
    }
};

checkDB();
