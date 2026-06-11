-- 1. The Central Auth Table (Already exists, just ensuring roles)
-- We keep 'users' for Login (Email/Password) ONLY.
-- Wrapped in DO block to safely handle constraints/enums if needed, but simple ALTER works for columns.
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50);
    END IF;
    
    -- We won't enforce CHECK constraint harshly on existing data to avoid crashes, 
    -- but new data will follow logic. 
    -- Ideally: ALTER TABLE users ADD CONSTRAINT role_check CHECK (role IN ('BRAND', 'CREATOR', 'ADMIN'));
END $$;

-- 2. The BRAND Storage (New Table)
CREATE TABLE IF NOT EXISTS brand_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE, -- Links to Login
  company_name VARCHAR(255),
  website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  gst_id VARCHAR(50),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_brand_user UNIQUE (user_id)
);

-- 3. The CREATOR Storage (New Table)
-- We eventually move niche/followers here, but keep them in 'users' for now to prevent crashes.
CREATE TABLE IF NOT EXISTS creator_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  niche VARCHAR(100),
  instagram_link VARCHAR(255),
  youtube_link VARCHAR(255),
  portfolio_link VARCHAR(255),
  follower_count VARCHAR(50),
  bio TEXT,
  budget_range VARCHAR(100),
  audience_breakdown TEXT,
  collaboration_goals TEXT,
  engagement_rate VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_creator_user UNIQUE (user_id)
);
