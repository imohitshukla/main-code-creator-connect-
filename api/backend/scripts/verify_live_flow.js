
const API_URL = 'http://localhost:5000/api';

async function verifyFlow() {
    console.log('🚀 Starting Verification: Live Campaign & Collab Flow');

    try {
        // 1. Create Brand User
        const brandEmail = `brand_TEST_${Date.now()}@example.com`;
        const brandPassword = 'password123';
        console.log(`\n🔹 Registering Brand: ${brandEmail}`);

        const brandRes = await fetch(`${API_URL}/auth/register/brand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_name: 'Test Brand Inc',
                email: brandEmail,
                password: brandPassword,
                phone_number: '1234567890',
                website: 'https://testbrand.com'
            })
        });

        const brandData = await brandRes.json();
        if (!brandRes.ok) throw new Error(`Brand registration failed: ${JSON.stringify(brandData)}`);
        console.log('✅ Brand Registered:', brandData.user.id);
        const brandToken = brandData.token;

        // 2. Post Campaign
        console.log('\n🔹 Posting Campaign...');
        const campaignRes = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${brandToken}`
            },
            body: JSON.stringify({
                title: 'Test Campaign 1',
                description: 'Looking for creators for a test campaign.',
                product_type: 'UGC',
                budget_range: '$500 - $1000',
                requirements: 'Must be awesome.',
                is_urgent: true,
                is_featured: false
            })
        });

        const campaignData = await campaignRes.json();
        if (!campaignRes.ok) throw new Error(`Campaign posting failed: ${JSON.stringify(campaignData)}`);
        console.log('✅ Campaign Posted:', campaignData.campaign.id);


        // 3. Create Creator User
        const creatorEmail = `creator_TEST_${Date.now()}@example.com`;
        console.log(`\n🔹 Registering Creator: ${creatorEmail}`);

        const creatorRes = await fetch(`${API_URL}/auth/register/creator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Creator',
                email: creatorEmail,
                password: brandPassword,
                phone_number: '0987654321',
                portfolio_link: 'https://portfolio.com'
            })
        });

        const creatorData = await creatorRes.json();
        if (!creatorRes.ok) throw new Error(`Creator registration failed: ${JSON.stringify(creatorData)}`);
        console.log('✅ Creator Registered:', creatorData.user.id);
        const creatorId = creatorData.user.id; // User ID
        // We need Creator Profile ID for linking, but the endpoint takes User ID usually. Let's check. 
        // creatorController.js: sendProposal takes creatorId (User ID) and looks up profile internally. Correct.

        // 4. Send Proposal (Make Collab)
        console.log('\n🔹 Sending Proposal (Make Collab)...');
        const proposalRes = await fetch(`${API_URL}/creators/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${brandToken}`
            },
            body: JSON.stringify({
                creatorId: creatorId,
                brandName: 'Test Brand Inc',
                budget: '$750',
                message: 'Hey, I love your work! Let\'s collab on this test campaign.'
            })
        });

        const proposalData = await proposalRes.json();
        if (!proposalRes.ok) throw new Error(`Proposal sending failed: ${JSON.stringify(proposalData)}`);
        console.log('✅ Proposal Sent:', proposalData);
        console.log(`🎉 Deal Created ID: ${proposalData.dealId}`);

        console.log('\n✅ VERIFICATION SUCCESSFUL: Both flows tested live.');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
    }
}

verifyFlow();
