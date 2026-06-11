import { client } from '../config/database.js';

async function inspectCampaigns() {
    try {
        await client.connect();
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns';
    `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.end();
    }
}

inspectCampaigns();
