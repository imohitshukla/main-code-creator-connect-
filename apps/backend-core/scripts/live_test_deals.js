
import fetch from 'node-fetch'; // or built-in in Node 18+

const API_URL = 'http://localhost:5000/api';
let brandToken = '';
let creatorToken = '';
let brandId = '';
let creatorId = '';
let dealId = '';

const TIMESTAMP = Date.now();
const BRAND_EMAIL = `testbrand${TIMESTAMP}@example.com`;
const CREATOR_EMAIL = `testcreator${TIMESTAMP}@example.com`;
const PASSWORD = 'password123';

async function step(name, fn) {
    try {
        console.log(`\n🔵 [STEP] ${name}...`);
        await fn();
        console.log(`✅ [SUCCESS] ${name}`);
    } catch (e) {
        console.error(`❌ [FAILED] ${name}:`, e.message);
        process.exit(1);
    }
}

async function request(method, endpoint, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // For manual cookie handling if needed, but we use Bearer for API testing usually
    // The backend accepts Bearer token in authMiddleware? Yes.

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
    console.log("🚀 Starting Live Deal Tracker Test");

    await step('Register Brand', async () => {
        const res = await request('POST', '/auth/signup', null, {
            name: 'Test Brand',
            email: BRAND_EMAIL,
            password: PASSWORD,
            role: 'BRAND'
        });
        brandToken = res.token;
        brandId = res.user.id;
        if (!brandToken) throw new Error("No token returned for Brand");
    });

    await step('Register Creator', async () => {
        const res = await request('POST', '/auth/signup', null, {
            name: 'Test Creator',
            email: CREATOR_EMAIL,
            password: PASSWORD,
            role: 'CREATOR'
        });
        creatorToken = res.token;
        creatorId = res.user.id;
        if (!creatorToken) throw new Error("No token returned for Creator");
    });

    await step('Brand Sends Proposal (Create Deal)', async () => {
        // We need the Creator's ID.
        // The endpoint is /api/creators/proposals
        const res = await request('POST', '/creators/proposals', brandToken, {
            creatorId: creatorId,
            brandName: 'Test Brand Inc.',
            budget: '₹50k - ₹1 Lakh',
            message: 'Live test proposal'
        });

        dealId = res.dealId;
        if (!dealId) throw new Error("No dealId returned from proposal");
        console.log(`   Detailed Created: ID ${dealId}`);
    });

    await step('Verify Deal State is OFFER', async () => {
        const res = await request('GET', `/deals/${dealId}`, brandToken);
        if (res.deal.status !== 'OFFER') throw new Error(`Expected OFFER, got ${res.deal.status}`);
    });

    // 1. Consent Gate
    await step('Creator Accepts Offer', async () => {
        // Creator accepts -> moves to SIGNING
        await request('PATCH', `/deals/${dealId}/status`, creatorToken, {
            status: 'SIGNING'
        });
        const res = await request('GET', `/deals/${dealId}`, creatorToken);
        if (res.deal.status !== 'SIGNING') throw new Error(`Expected SIGNING`);
    });

    await step('Both Parties Sign Contract', async () => {
        // Brand Signs
        let getRes = await request('GET', `/deals/${dealId}`, brandToken);
        let metadata = getRes.deal.current_stage_metadata || {};
        metadata.brand_signed = true;
        await request('PATCH', `/deals/${dealId}/status`, brandToken, { status: 'SIGNING', metadata });

        // Creator Signs
        getRes = await request('GET', `/deals/${dealId}`, creatorToken);
        metadata = getRes.deal.current_stage_metadata || {};
        metadata.creator_signed = true;

        // Move to LOGISTICS (New Logic)
        await request('PATCH', `/deals/${dealId}/status`, creatorToken, { status: 'LOGISTICS', metadata });

        const res = await request('GET', `/deals/${dealId}`, creatorToken);
        if (res.deal.status !== 'LOGISTICS') throw new Error(`Expected LOGISTICS`);
    });

    // 2. Logistics Buffer
    await step('Brand Provides Tracking', async () => {
        await request('PATCH', `/deals/${dealId}/status`, brandToken, {
            status: 'LOGISTICS',
            metadata: { tracking_number: 'UPS123TEST' }
        });
    });

    await step('Creator Confirms Receipt (Start Production)', async () => {
        await request('PATCH', `/deals/${dealId}/status`, creatorToken, {
            status: 'PRODUCTION',
            metadata: { received_at: new Date().toISOString() }
        });
        const res = await request('GET', `/deals/${dealId}`, creatorToken);
        if (res.deal.status !== 'PRODUCTION') throw new Error(`Expected PRODUCTION`);
    });

    await step('Creator Uploads Draft 1', async () => {
        const fakeUrl = 'https://fake-url.com/draft1.png';
        const getRes = await request('GET', `/deals/${dealId}`, creatorToken);
        const metadata = getRes.deal.current_stage_metadata || {};

        metadata.draft_url = fakeUrl;
        metadata.draft_uploaded_at = new Date().toISOString();

        await request('PATCH', `/deals/${dealId}/status`, creatorToken, {
            status: 'REVIEW',
            metadata: metadata
        });
    });

    // 3. Rejection Loop
    await step('Brand Requests Changes (Reject)', async () => {
        const getRes = await request('GET', `/deals/${dealId}`, brandToken);
        if (getRes.deal.status !== 'REVIEW') throw new Error(`Expected REVIEW`);

        // Send back to PRODUCTION with feedback
        await request('PATCH', `/deals/${dealId}/status`, brandToken, {
            status: 'PRODUCTION',
            metadata: { feedback: 'Audio is low. Please fix.', revision_requested: true }
        });

        const res = await request('GET', `/deals/${dealId}`, brandToken);
        if (res.deal.status !== 'PRODUCTION') throw new Error(`Expected PRODUCTION (Rejection)`);
    });

    await step('Creator Uploads Draft 2 (Revision)', async () => {
        const fakeUrl = 'https://fake-url.com/draft2_fixed.png';
        const getRes = await request('GET', `/deals/${dealId}`, creatorToken);
        const metadata = getRes.deal.current_stage_metadata || {};

        metadata.draft_url = fakeUrl;
        metadata.feedback = null; // Clear feedback flag optionally
        metadata.draft_uploaded_at = new Date().toISOString();

        await request('PATCH', `/deals/${dealId}/status`, creatorToken, {
            status: 'REVIEW',
            metadata: metadata
        });
    });

    await step('Brand Approves Work (Final)', async () => {
        const getRes = await request('GET', `/deals/${dealId}`, brandToken);
        if (getRes.deal.status !== 'REVIEW') throw new Error(`Expected REVIEW`);

        await request('PATCH', `/deals/${dealId}/status`, brandToken, {
            status: 'APPROVED'
        });
    });

    await step('Brand Terminates Deal (Kill Switch)', async () => {
        await request('POST', `/deals/${dealId}/terminate`, brandToken, {
            reason: 'Test verify termination'
        });

        const res = await request('GET', `/deals/${dealId}`, brandToken);
        if (res.deal.status !== 'CANCELLED') throw new Error("Deal should be CANCELLED");
    });

    console.log("\n✨ Live Test Completed Successfully!");
}

run();
