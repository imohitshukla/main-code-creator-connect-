-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  participants JSONB NOT NULL,
  campaign_id INTEGER REFERENCES campaigns(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- If messages table already exists but needs conversation_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
            ALTER TABLE messages ADD COLUMN conversation_id INTEGER REFERENCES conversations(id);
        END IF;
    END IF;
END $$;
