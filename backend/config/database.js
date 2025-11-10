import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
await client.connect();

export default client;
