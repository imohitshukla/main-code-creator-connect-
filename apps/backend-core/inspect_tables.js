import { client } from './config/database.js';

async function run() {
  try {
    const deals = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'deals';
    `);
    console.log("DEALS TABLE:", deals.rows);

    const conv = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversations';
    `);
    console.log("CONVERSATIONS TABLE:", conv.rows);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
