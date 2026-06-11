
import fetch from 'node-fetch';
import fs from 'fs';

const API_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const PASSWORD = 'password123';

async function request(method, endpoint, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.error || data.message || res.statusText);
        return data;
    } catch (e) {
        throw new Error(`API Error (${res.status}): ${text}`);
    }
}

async function run() {
    console.log("🌱 Seeding Data for Browser Test...");

    // 1. Register Brand
    const brandEmail = `brand_ui_${TIMESTAMP}@test.com`;
    const brandRes = await request('POST', '/auth/signup', null, {
        name: 'UI Test Brand',
        email: brandEmail,
        password: PASSWORD,
        role: 'BRAND'
    });
    const brandToken = brandRes.token;
    const brandId = brandRes.user.id;

    // 2. Register Creator
    const creatorEmail = `creator_ui_${TIMESTAMP}@test.com`;
    const creatorRes = await request('POST', '/auth/signup', null, {
        name: 'UI Test Creator',
        email: creatorEmail,
        password: PASSWORD,
        role: 'CREATOR'
    });
    const creatorToken = creatorRes.token;
    const creatorId = creatorRes.user.id;

    // 3. Create Deal (Brand sends proposal)
    const dealRes = await request('POST', '/creators/proposals', brandToken, {
        creatorId: creatorId,
        brandName: 'UI Test Brand Inc.',
        budget: '₹50k - ₹1 Lakh',
        message: 'This is a seed deal for UI testing.'
    });
    const dealId = dealRes.dealId;

    console.log(`✅ Seeded Successfully!`);
    console.log(`   Brand: ${brandEmail} / ${PASSWORD}`);
    console.log(`   Creator: ${creatorEmail} / ${PASSWORD}`);
    console.log(`   Deal ID: ${dealId} (Status: OFFER)`);

    const output = {
        brand: { email: brandEmail, password: PASSWORD },
        creator: { email: creatorEmail, password: PASSWORD },
        dealId: dealId
    };

    fs.writeFileSync('test_creds.json', JSON.stringify(output, null, 2));
    console.log("💾 Credentials saved to test_creds.json");
}

run();
