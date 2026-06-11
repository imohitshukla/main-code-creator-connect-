import { client } from './config/database.js';

async function inspectUsers() {
    try {
        const res = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);

        console.log('Role column in users:', res.rows[0]);

        if (res.rows[0].udt_name === 'user_role') {
            const enumRes = await client.query(`
            SELECT unnest(enum_range(NULL::user_role)) as value
        `);
            console.log('Enum user_role values:', enumRes.rows.map(r => r.value));
        }

    } catch (err) {
        console.error('Error inspecting users:', err);
    } finally {
        client.end();
    }
}

inspectUsers();
