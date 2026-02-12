const fetch = require('node-fetch'); // Ensure node-fetch is available, or use built-in fetch if Node 18+

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'testbrand_verify_222@example.com', password: 'password123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login successful. Token:", token ? "Present" : "Missing");

        // 2. Get Brand Profile
        console.log("Fetching Brand Profile...");
        const profileRes = await fetch(`${API_URL}/brands/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileRes.status === 404) {
            console.log("Brand profile not found (Expected if new).");
        } else if (profileRes.ok) {
            const profileData = await profileRes.json();
            console.log("Brand profile found:", profileData.profile?.company_name);
        } else {
            console.error("Fetch profile failed:", profileRes.status);
        }

        // 3. Update/Create Brand Profile
        console.log("Updating Brand Profile...");
        const updateRes = await fetch(`${API_URL}/brands/profile`, {
            method: 'POST', // or PUT, depending on logic. BrandOnboarding uses POST for create, PUT for update. Let's try POST first (upsert logic in controller?) NO, controller insert checks existence.
            // Wait, brandController.js: createBrandProfile checks existence and returns 409 if exists.
            // updateBrandProfile handles updates.
            // So we need to check if profile exists, then decide.
            // If profile found above, use PUT. Else POST.
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company_name: "Test Brand Node Verify",
                industry_vertical: "Tech",
                website_url: "https://node-verify.com",
                company_size: "Startup (1-10)",
                hq_location: "Node Land",
                typical_budget_range: "₹10k - ₹25k",
                looking_for: ["UGC"]
            })
        });

        // If POST fails with 409 (Conflict), try PUT
        if (updateRes.status === 409) {
            console.log("Profile exists (409). Trying PUT...");
            const putRes = await fetch(`${API_URL}/brands/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    company_name: "Test Brand Node Verify UPDATED",
                    industry_vertical: "Tech",
                    website_url: "https://node-verify.com",
                    company_size: "Startup (1-10)",
                    hq_location: "Node Land",
                    typical_budget_range: "₹10k - ₹25k",
                    looking_for: ["UGC", "Reels"]
                })
            });
            console.log("PUT Response:", putRes.status);
            const putData = await putRes.json();
            console.log("PUT Data:", putData);
        } else {
            console.log("POST Response:", updateRes.status);
            const postData = await updateRes.json();
            console.log("POST Data:", postData);
        }

        // 4. Verify Final State
        const finalRes = await fetch(`${API_URL}/brands/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const finalData = await finalRes.json();
        console.log("Final Profile Name:", finalData.profile?.company_name);
        console.log("Final Looking For:", finalData.profile?.looking_for);

    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
