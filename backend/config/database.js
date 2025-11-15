import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));
export { client };
