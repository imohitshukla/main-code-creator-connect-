import { Pool } from 'pg';

const isProduction =
  process.env.NODE_ENV === 'production' ||
  (process.env.DB_HOST && process.env.DB_HOST.includes('render'));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        isProduction || process.env.DATABASE_URL.includes('render.com')
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const client = new Pool(poolConfig);

client
  .connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error:', err));

export { client };
