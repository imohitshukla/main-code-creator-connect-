import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=2000):
    np.random.seed(42)
    
    # Generate labels: 50% real (0), 50% fake (1)
    fake_label = np.random.choice([0, 1], size=num_samples)
    
    data = []
    for is_fake in fake_label:
        if is_fake:
            # Bot/Fake characteristics
            nums_length_username = np.random.uniform(0.3, 0.9)  # High ratio of numbers in username
            description_length = int(np.random.exponential(15)) # Usually short or empty bio
            external_url = np.random.choice([0, 1], p=[0.8, 0.2]) # Usually no URL, sometimes spam URL
            private = np.random.choice([0, 1], p=[0.7, 0.3]) # Often public to spam
            posts = int(np.random.exponential(5)) # Very few posts
            followers = int(np.random.exponential(50)) # Few followers
            follows = int(np.random.normal(1500, 500)) # Follows a lot of people
            follows = max(0, follows)
        else:
            # Real/Organic characteristics
            nums_length_username = np.random.uniform(0.0, 0.2)  # Low ratio of numbers
            description_length = int(np.random.normal(50, 20)) # Normal length bio
            description_length = max(0, description_length)
            external_url = np.random.choice([0, 1], p=[0.6, 0.4]) 
            private = np.random.choice([0, 1], p=[0.5, 0.5])
            posts = int(np.random.normal(150, 100))
            posts = max(0, posts)
            followers = int(np.random.lognormal(mean=6, sigma=1.5)) # Log-normal distribution of followers
            follows = int(np.random.normal(400, 200))
            follows = max(0, follows)
            
        data.append({
            'nums_length_username': round(nums_length_username, 3),
            'description_length': description_length,
            'external_URL': external_url,
            'private': private,
            'num_posts': posts,
            'num_followers': followers,
            'num_follows': follows,
            'fake': is_fake
        })
        
    df = pd.DataFrame(data)
    
    # Save to csv
    output_path = os.path.join(os.path.dirname(__file__), 'fake_instagram_profile.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {num_samples} samples and saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_data()
