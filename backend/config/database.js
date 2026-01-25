import 'dotenv/config';
import { Pool } from 'pg';

const isProduction =
  process.env.NODE_ENV === 'production' ||
  (process.env.DB_HOST && process.env.DB_HOST.includes('render'));

console.log('DEBUG: DB Config Loading...');
console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
console.log('DEBUG: DB_HOST is', process.env.DB_HOST || 'MISSING');
console.log('DEBUG: NODE_ENV is', process.env.NODE_ENV);

const poolConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl:
      isProduction || process.env.DATABASE_URL.includes('render.com') || process.env.DATABASE_URL.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    connectionTimeoutMillis: 30000, // Increased to 30s for cold starts
    idleTimeoutMillis: 30000,
    max: 10,
    keepAlive: true, // Prevent dropped connections
  }
  : {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: isProduction || (process.env.DB_HOST && (process.env.DB_HOST.includes('render') || process.env.DB_HOST.includes('neon'))) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
  };

const client = new Pool(poolConfig);

// Robust Error Handling for the Pool
client.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle database client', err);
  // Don't exit process, just log. The pool will try to reconnect/create new clients.
});

// Initial Connection Test
client
  .connect()
  .then((client) => {
    console.log('✅ Database connected successfully');
    client.release(); // Release immediately after test
  })
  .catch((err) => {
    console.error('❌ Database connection error on startup:', err);
    // Optional: process.exit(1) if DB is critical for startup
  });

export { client };
