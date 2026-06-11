import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import {
  smartMatchCreators,
  detectFraud,
  getPricingRecommendation,
  analyzeContent,
  getCreatorIntelligenceReport,
  getCachedCreatorReport,
  compareCreators,
  saveAIMatchResults,
  getAIMatchResults,
  listPreviousMatches,
} from '../controllers/aiController.js';

// Pulse Engine — imported from the isolated microservice
import { getPulseAnalysis } from '../../../services/pulse-engine/api/pulseController.js';

const app = new Hono();

// ── Public routes (limited AI features for discovery) ────────────────────────
app.post('/smart-match', smartMatchCreators);

// Pulse Sandbox: public endpoint — clinical data science audit (no financials)
app.post('/pulse', getPulseAnalysis);

// ── Protected routes (require authentication) ────────────────────────────────
app.use('*', authMiddleware);

// AI-powered creator matching (authenticated)
app.post('/smart-match/authenticated', smartMatchCreators);

// Fraud detection for creators
app.post('/fraud-detect', detectFraud);

// Dynamic pricing recommendations
app.post('/pricing', getPricingRecommendation);

// Content analysis for visual content
app.post('/content-analysis', analyzeContent);

// Creator intelligence reports
app.post('/creator-intel/:creatorId', getCreatorIntelligenceReport);
app.get('/creator-intel/:creatorId/cached', getCachedCreatorReport);

// Compare 2-3 creators
app.post('/compare', compareCreators);

// AI match result persistence
app.post('/matches/save', saveAIMatchResults);
app.get('/matches', getAIMatchResults);
app.get('/matches/history', listPreviousMatches);

// Bulk fraud detection (admin only)
app.post('/bulk-fraud-check', async (c) => {
  try {
    const { creatorIds } = await c.req.json();
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const results = await Promise.all(
      creatorIds.map(async (id) => ({
        creatorId: id,
        status: 'Use /fraud-detect for individual creator checks',
      }))
    );

    return c.json({ bulkResults: results });
  } catch (error) {
    console.error('Bulk Fraud Check Error:', error);
    return c.json({ error: 'Failed to perform bulk fraud check' }, 500);
  }
});

export default app;
