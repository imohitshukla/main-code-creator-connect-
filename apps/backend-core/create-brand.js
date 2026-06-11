
// import fetch from 'node-fetch'; // Not needed in Node 18+

async function createBrand() {
    const url = 'http://localhost:5000/api/auth/register/brand';
    const payload = {
        company_name: "Test Brand Inc",
        email: "fresh_brand_test_v1@example.com",
        password: "Password123!",
        phone_number: "1234567890",
        website: "https://testbrand.com",
        website_url: "https://testbrand.com" // Just in case schema requires one or the other
    };

    try {
        console.log(`Sending request to ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Response Status:', response.status);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Could not parse JSON:", e);
        }

        if (response.ok) {
            console.log("✅ successfully created brand user:", data);
        } else {
            console.error("❌ Failed to create user:", data || text);
        }

    } catch (error) {
        console.error("Network error:", error);
    }
}

createBrand();
