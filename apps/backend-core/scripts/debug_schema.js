
import { client } from '../config/database.js';

const inspectSchema = async () => {
    try {
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns';
    `);
        console.log('Campaigns Table Schema:');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Schema Inspection Error:', err);
        process.exit(1);
    }
};

inspectSchema();
