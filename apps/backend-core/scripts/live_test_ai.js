import { spawn } from 'child_process';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;
const API_BASE = `http://localhost:${PORT}/api`;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Generate token for testing (using brand user ID 65)
const testToken = jwt.sign({ id: 65, role: 'brand' }, JWT_SECRET, { expiresIn: '1h' });
const authHeaders = {
  'Authorization': `Bearer ${testToken}`,
  'Content-Type': 'application/json'
};

console.log('🔑 Generated test JWT Token for brand user 65.');

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startServer() {
  console.log('🚀 Spawning backend server...');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: '/Users/mohitshukla/niche-connect-project/api',
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit' // let it print logs to our stdout/stderr
  });

  // Wait for server to come online
  let retries = 30;
  while (retries > 0) {
    try {
      const res = await axios.get(`${API_BASE}/health`, { timeout: 1000 });
      if (res.status === 200) {
        console.log('✅ Server is up and listening!');
        return serverProcess;
      }
    } catch (e) {
      // Server not ready yet
    }
    await sleep(500);
    retries--;
  }

  serverProcess.kill();
  throw new Error('❌ Server failed to start within timeout.');
}

async function runTests() {
  let serverProcess;
  try {
    serverProcess = await startServer();
    console.log('\n🧪 Running AI Endpoints Tests...\n');

    // 1. Test Smart Match Creator Discovery
    console.log('----------------------------------------------------');
    console.log('1. Testing POST /api/ai/smart-match...');
    try {
      const matchRes = await axios.post(`${API_BASE}/ai/smart-match`, {
        campaignDescription: 'Looking for a fitness creator for energy drink promotion',
        targetAudience: '18-25 gym goers in India',
        budget: '₹20000',
        niche: 'fitness'
      }, { headers: authHeaders });
      console.log('🟢 Status:', matchRes.status);
      console.log('🟢 Response keys:', Object.keys(matchRes.data));
      console.log('🟢 Matches found:', matchRes.data.matches.map(m => `${m.name} (Niche: ${m.niche}, Score: ${m.matchScore})`));
      console.log('🟢 AI Analysis:', matchRes.data.aiAnalysis);
    } catch (error) {
      console.error('🔴 Smart Match Test Failed:', error.response?.data || error.message);
    }

    // 2. Test Pricing Recommendations
    console.log('----------------------------------------------------');
    console.log('2. Testing POST /api/ai/pricing...');
    try {
      const pricingRes = await axios.post(`${API_BASE}/ai/pricing`, {
        creatorId: 26, // Anmol Warikoo
        campaignBudget: 25000
      }, { headers: authHeaders });
      console.log('🟢 Status:', pricingRes.status);
      console.log('🟢 Recommended Price:', pricingRes.data.recommendedPrice);
      console.log('🟢 Base Price:', pricingRes.data.basePrice);
      console.log('🟢 Market Position:', pricingRes.data.marketPosition);
      console.log('🟢 Factors:', pricingRes.data.factors);
      console.log('🟢 AI Analysis:', pricingRes.data.aiAnalysis);
    } catch (error) {
      console.error('🔴 Pricing Test Failed:', error.response?.data || error.message);
    }

    // 3. Test Creator Intelligence Report
    console.log('----------------------------------------------------');
    console.log('3. Testing POST /api/ai/creator-intel/:creatorId...');
    try {
      const intelRes = await axios.post(`${API_BASE}/ai/creator-intel/26`, {
        campaignDescription: 'Gym powder launch',
        budget: '₹15000',
        targetAudience: 'Athletes'
      }, { headers: authHeaders });
      console.log('🟢 Status:', intelRes.status);
      console.log('🟢 Scorecard:', intelRes.data.scorecard);
      console.log('🟢 Valuation:', intelRes.data.valuation);
      console.log('🟢 Primary Platform:', intelRes.data.primaryPlatform);
      console.log('🟢 Followers:', intelRes.data.primaryFollowers);
      console.log('🟢 Summary Text:', intelRes.data.summaryText);
    } catch (error) {
      console.error('🔴 Intelligence Report Test Failed:', error.response?.data || error.message);
    }

    // 4. Test Cached Report Retrieval
    console.log('----------------------------------------------------');
    console.log('4. Testing GET /api/ai/creator-intel/:creatorId/cached...');
    try {
      const cachedRes = await axios.get(`${API_BASE}/ai/creator-intel/26/cached`, { headers: authHeaders });
      console.log('🟢 Status:', cachedRes.status);
      console.log('🟢 Has Cached Report:', cachedRes.data.hasReport);
      if (cachedRes.data.hasReport) {
        console.log('🟢 Last Run:', cachedRes.data.lastRun);
        console.log('🟢 Cached Scorecard overallScore:', cachedRes.data.report.scorecard?.overallScore);
      }
    } catch (error) {
      console.error('🔴 Cached Report Test Failed:', error.response?.data || error.message);
    }

    // 5. Test Compare Creators
    console.log('----------------------------------------------------');
    console.log('5. Testing POST /api/ai/compare...');
    try {
      const compareRes = await axios.post(`${API_BASE}/ai/compare`, {
        creatorIds: [26, 30], // Anmol Warikoo & Mohit
        brandContext: {
          campaignDescription: 'New activewear campaign comparison',
          targetAudience: 'Fitness & Travel enthusiasts',
          budget: '₹35000'
        }
      }, { headers: authHeaders });
      console.log('🟢 Status:', compareRes.status);
      console.log('🟢 Comparison Narrative:', compareRes.data.narrative);
      console.log('🟢 Overlap Matrix:', compareRes.data.overlap);
      console.log('🟢 Scored Creators:', compareRes.data.creators.map(c => `${c.name} (Score: ${c.score}/100, Est Price: ₹${c.pricing})`));
    } catch (error) {
      console.error('🔴 Compare Creators Test Failed:', error.response?.data || error.message);
    }

    // 6. Test Content Analysis
    console.log('----------------------------------------------------');
    console.log('6. Testing POST /api/ai/content-analysis...');
    try {
      const analysisRes = await axios.post(`${API_BASE}/ai/content-analysis`, {
        creatorId: 26 // Anmol Warikoo
      }, { headers: authHeaders });
      console.log('🟢 Status:', analysisRes.status);
      console.log('🟢 Analysis result:', analysisRes.data.analysis);
      console.log('🟢 Quality classification:', analysisRes.data.quality);
    } catch (error) {
      console.error('🔴 Content Analysis Test Failed:', error.response?.data || error.message);
    }

    console.log('----------------------------------------------------');
    console.log('🏁 All live tests completed!');

  } catch (error) {
    console.error('❌ Test runner error:', error);
  } finally {
    if (serverProcess) {
      console.log('🛑 Shutting down server process...');
      serverProcess.kill('SIGINT');
      await sleep(1000);
      console.log('💀 Server shut down successfully.');
    }
    process.exit(0);
  }
}

runTests();
