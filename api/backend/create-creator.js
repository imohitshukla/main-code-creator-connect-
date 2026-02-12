
// import fetch from 'node-fetch'; // Not needed in Node 18+

async function createCreator() {
    const url = 'http://localhost:5000/api/auth/register/creator';
    const payload = {
        name: "Fresh Creator",
        email: "fresh_creator_test_v2@example.com",
        password: "Password123!",
        phone_number: "1234567890",
        // portfolio_link: "https://example.com" // Optional
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
        console.log('Response Text:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Could not parse JSON:", e);
        }

        if (response.ok) {
            console.log("✅ successfully created creator user:", data);
        } else {
            console.error("❌ Failed to create user:", data || text);
        }


    } catch (error) {
        console.error("Network error:", error);
    }
}

createCreator();
