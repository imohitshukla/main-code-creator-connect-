import { client } from '../config/database.js';

async function test() {
    try {
        const id = 19; // The ID from the user's screenshot, might not exist locally but we can create one
        // Let's just create a mock deal first
        const newDeal = await client.query(`
      INSERT INTO deals (brand_id, creator_id, amount, currency, deliverables, status, current_stage_metadata)
      VALUES (1, 1, 1000, 'INR', 'Test', 'OFFER', '{}')
      RETURNING id
    `);
        const dealId = newDeal.rows[0].id;
        console.log("Created deal:", dealId);

        const status = 'SIGNING';
        const newMetadata = { test: true };

        console.log(`Updating deal ${dealId} status to ${status}. Metadata:`, newMetadata);

        const updatedDeal = await client.query(`
      UPDATE deals
      SET status = $1, current_stage_metadata = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, newMetadata, dealId]);

        console.log("Success:", updatedDeal.rows[0]);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}

test();
