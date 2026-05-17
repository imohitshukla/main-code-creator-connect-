import { client } from './config/database.js';
import { updateDealStatus, getDealTimeline } from './controllers/dealController.js';

async function run() {
  let dealId = null;
  try {
    console.log("1. Creating dummy deal...");
    const res = await client.query(`
      INSERT INTO deals (brand_id, creator_id, deliverables, amount, currency, status)
      VALUES (46, 32, 'Test Video', 100, 'USD', 'OFFER')
      RETURNING id
    `);
    dealId = res.rows[0].id;
    console.log("   ✅ Deal created with ID:", dealId);

    // Mock Request Context
    const mockContext = (payload) => ({
      req: {
        param: (name) => name === 'id' ? dealId : null,
        json: async () => payload
      },
      get: (name) => name === 'user' ? { id: 65, role: 'BRAND' } : null, // user_id: 65 corresponds to brand_id: 46
      json: (data, status) => { return data; } // suppress verbose logging
    });

    console.log("\n2. Updating Deal Status to SIGNING...");
    const update1 = await updateDealStatus(mockContext({ status: 'SIGNING', metadata: { signed: true } }));
    console.log("   ✅ Status updated to SIGNING:", update1.deal?.status);

    console.log("\n3. Updating Deal Status to PRODUCTION...");
    const update2 = await updateDealStatus(mockContext({ status: 'PRODUCTION', metadata: { draft_link: 'http://example.com' } }));
    console.log("   ✅ Status updated to PRODUCTION:", update2.deal?.status);

    console.log("\n4. Fetching Timeline...");
    const timelineRes = await getDealTimeline(mockContext({}));
    console.log("\n   ✅ Timeline Array Length:", timelineRes.timeline?.length);
    console.log(JSON.stringify(timelineRes.timeline, null, 2));

    if (timelineRes.timeline && timelineRes.timeline.length === 2) {
      console.log("\n🚀 TEST PASSED: Successfully tracked 2 stage transitions in the DB.");
    } else {
      console.error("\n❌ TEST FAILED: Timeline does not have 2 logs.");
    }

  } catch (e) {
    console.error("❌ Test script encountered an error:", e);
  } finally {
    if (dealId) {
      console.log("\n5. Cleaning up Database...");
      await client.query('DELETE FROM deals WHERE id = $1', [dealId]);
      console.log("   ✅ Cleanup done.");
    }
    process.exit(0);
  }
}
run();
