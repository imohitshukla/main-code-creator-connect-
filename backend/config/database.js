const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
await client.connect();
module.exports = client;;
