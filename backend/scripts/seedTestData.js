import { Client } from 'pg';
import 'dotenv/config';

const seedTestData = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();

    // Insert test users including the one for auth test
    console.log('Inserting test users...');
    await client.query(
      `INSERT INTO users (email, password, role, phone_number, is_phone_verified)
       VALUES
       ('brand@example.com', 'passwordhashed', 'brand', '1234567890', true),
       ('creator@example.com', 'passwordhashed', 'creator', '0987654321', true),
('mohitshukla57662@gmail.com', '$2a$10$1fZ7XLyFUfmQQkxlnOVCqeHio2sNFnNPLi0SNvRJ.bUkHcfelqT5O', 'brand', null, true)
       ON CONFLICT (email) DO NOTHING;`
    );
    console.log('Test users inserted');

    // Get user ids
    const resUsers = await client.query(`SELECT id, email FROM users WHERE email IN ('brand@example.com', 'creator@example.com')`);
    const usersMap = {};
    resUsers.rows.forEach(row => {
      usersMap[row.email] = row.id;
    });

    // Insert brand_profile
    console.log('Inserting brand profile...');
    await client.query(
      `INSERT INTO brand_profiles (user_id, company_name, industry, website, description)
       VALUES ($1, 'Brand Co', 'Retail', 'https://brandco.com', 'A retail brand')
       ON CONFLICT (user_id) DO NOTHING;`,
      [usersMap['brand@example.com']]
    );
    console.log('Brand profile inserted');

    // Insert creator_profile
    console.log('Inserting creator profile for user:', usersMap['creator@example.com']);
    await client.query(
      `INSERT INTO creator_profiles (user_id, name, bio, niche, social_links, portfolio_links, followers, engagement_rate, location, verified)
       VALUES ($1, 'Creator One', 'Bio of creator', 'fitness', '[]', '[]', 1000, 5.5, 'NYC', true)
       ON CONFLICT (user_id) DO NOTHING;`,
      [usersMap['creator@example.com']]
    );
    console.log('Creator profile inserted');

    // Insert campaigns (replace budget with budget_range)
    await client.query(
      `INSERT INTO campaigns (brand_id, title, description, niche, budget_range, requirements, deadline, status)
       VALUES ($1, 'New Campaign', 'A sample campaign description', 'fitness', '1000-5000', 'Must have 1000+ followers', CURRENT_DATE + INTERVAL '30 days', 'active')`,
      [usersMap['brand@example.com']]
    );

    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error.message);
  } finally {
    await client.end();
  }
};

seedTestData();
