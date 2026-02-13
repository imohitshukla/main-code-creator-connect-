import { client } from './config/database.js';

async function inspectConstraints() {
    try {
        const res = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'brand_profiles'::regclass;
    `);

        console.log('Constraints on brand_profiles:');
        if (res.rows.length === 0) {
            console.log('No constraints found.');
        }
        res.rows.forEach(row => {
            console.log(`- ${row.conname} (${row.contype}): ${row.pg_get_constraintdef}`);
        });
    } catch (err) {
        console.error('Error inspecting constraints:', err);
    } finally {
        client.end();
    }
}

inspectConstraints();
