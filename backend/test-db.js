import 'dotenv/config';
import { Client } from 'pg';

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

client.connect()
  .then(() => {
    console.log('Connected to database');
    return client.end();
  })
  .catch(err => console.error('Connection error:', err));
