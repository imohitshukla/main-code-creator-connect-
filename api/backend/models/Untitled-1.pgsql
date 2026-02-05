-- /* Step 1: Just check if we can see the table (Run this first) */
-- SELECT id, email FROM public.users LIMIT 2;

-- /* Step 2: Add the columns (Run this second) */
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS niche VARCHAR(255) DEFAULT 'General Creator';
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'India';
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS followers_count VARCHAR(50) DEFAULT '0';
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(255);

UPDATE public.users 
SET followers_count = '60k', niche = 'Actor & Lifestyle' 
WHERE id = 5;