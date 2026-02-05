
import { Client } from 'pg';
import 'dotenv/config';

const setupSchema = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const connectionString = process.env.DATABASE_URL;

  let clientConfig;
  if (connectionString) {
    clientConfig = {
      connectionString,
      ssl: isProduction || connectionString.includes('render.com') || connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    };
  } else {
    clientConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: isProduction || (process.env.DB_HOST && process.env.DB_HOST.includes('render')) ? { rejectUnauthorized: false } : false,
    };
  }

  const appClient = new Client(clientConfig);

  try {
    await appClient.connect();
    console.log('Connected to database...');

    // Create enum types
    await appClient.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('brand', 'creator');
        END IF;
      END $$;
    `);

    // Drop tables if they exist to ensure schema is up to date
    console.log('Resetting schema...');
    await appClient.query(`
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS contracts CASCADE;
      DROP TABLE IF EXISTS analytics CASCADE;
      DROP TABLE IF EXISTS calendars CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS conversations CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS contact_submissions CASCADE;
      DROP TABLE IF EXISTS proposals CASCADE;
      DROP TABLE IF EXISTS campaigns CASCADE;
      DROP TABLE IF EXISTS brand_profiles CASCADE;
      DROP TABLE IF EXISTS creator_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS media_kits CASCADE;
      DROP TABLE IF EXISTS campaign_ai_matches CASCADE;
    `);

    console.log('Creating tables...');
    // Create tables
    await appClient.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        phone_number VARCHAR(20),
        phone_otp VARCHAR(6),
        otp_expires_at TIMESTAMP,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE creator_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        portfolio_links JSONB DEFAULT '[]'::JSONB,
        bio TEXT,
        social_media JSONB DEFAULT '[]'::JSONB,
        niche VARCHAR(100),
        follower_count INTEGER DEFAULT 0,
        engagement_rate DECIMAL(5,2),
        audience JSONB,
        budget JSONB,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE media_kits (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content JSONB NOT NULL,
        is_public BOOLEAN DEFAULT TRUE,
        views INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS brand_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        website VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES brand_profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        niche VARCHAR(100),
        budget_range VARCHAR(100),
        requirements TEXT,
        deadline DATE,
        status VARCHAR(50) DEFAULT 'active',
        disclosures TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        creator_id INTEGER REFERENCES creator_profiles(id) ON DELETE CASCADE,
        proposal_text TEXT,
        budget_proposed DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        message TEXT,
        related_id INTEGER,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        participants JSONB NOT NULL,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        campaign_id INTEGER REFERENCES campaigns(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add verified column to creator_profiles if not exists (redundant but safe)
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'creator_profiles' AND column_name = 'verified'
        ) THEN
          ALTER TABLE creator_profiles ADD COLUMN verified BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        creator_id INTEGER REFERENCES creator_profiles(id) ON DELETE CASCADE,
        metrics JSONB DEFAULT '{}'::JSONB,
        engagement_rate DECIMAL(5,2),
        roi DECIMAL(10,2),
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
        terms TEXT NOT NULL,
        signed BOOLEAN DEFAULT FALSE,
        signature_data JSONB DEFAULT '{}'::JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        stripe_id VARCHAR(255),
        escrow_released BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS calendars (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER REFERENCES creator_profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        scheduled_date DATE NOT NULL,
        platform VARCHAR(50),
        content_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS campaign_ai_matches (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ai_matches JSONB NOT NULL,
        search_hash VARCHAR(32),
        search_context JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_creator_niche ON creator_profiles(niche);
      CREATE INDEX IF NOT EXISTS idx_campaign_niche ON campaigns(niche);
      CREATE INDEX IF NOT EXISTS idx_campaign_status ON campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON analytics(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_contracts_proposal ON contracts(proposal_id);
      CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);

    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await appClient.end();
  }
};

setupSchema();
