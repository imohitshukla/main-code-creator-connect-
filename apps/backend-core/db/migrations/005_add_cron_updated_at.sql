-- Add last_updated_at for cron sync tracking
ALTER TABLE creator_profiles 
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
