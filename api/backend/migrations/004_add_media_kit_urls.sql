-- Add new multimedia columns to creator_profiles
ALTER TABLE creator_profiles 
ADD COLUMN IF NOT EXISTS media_kit_url TEXT,
ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
