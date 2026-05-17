import { client } from '../config/database.js';

async function migrate() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS deal_timeline_logs (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
        old_stage VARCHAR(50),
        new_stage VARCHAR(50) NOT NULL,
        changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        notes TEXT
      );
      
      CREATE INDEX IF NOT EXISTS deal_timeline_logs_deal_id_index ON deal_timeline_logs(deal_id);
      CREATE INDEX IF NOT EXISTS deal_timeline_logs_timestamp_index ON deal_timeline_logs(timestamp);
    `);
    console.log("Migration complete: deal_timeline_logs table created.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
