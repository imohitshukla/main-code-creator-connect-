/* Update User ID 5 (Divyansh) directly */
UPDATE public.users 
SET 
    followers_count = '60k', 
    bio = 'Professional Actor & Lifestyle Creator based in Mumbai. Passionate about travel, fashion, and storytelling. Open for brand collaborations.',
    location = 'Mumbai, India',
    niche = 'Actor & Lifestyle',
    profile_image = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
WHERE id = 5;

/* Check the result - You should see his data now */
SELECT id, name, followers_count, bio FROM public.users WHERE id = 5;