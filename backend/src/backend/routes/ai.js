import { Hono } from 'hono';
import { smartMatchCreators, detectFraud, getPricingRecommendation, analyzeContent, saveAIMatchResults, getAIMatchResults, listPreviousMatches } from '../../../controllers/aiController.js';
import { authMiddleware } from '../../../middleware/auth.js';

const app = new Hono();

// AI-powered creator matching (public for discovery)
app.post('/smart-match', smartMatchCreators); // Accepts campaignDescription, targetAudience, budget, niche and brief.

// Protected routes (require authentication)
app.use('*', authMiddleware);

// Save AI match results
app.post('/smart-match/save', saveAIMatchResults);

// Continue from previous AI match results
app.get('/smart-match/continue', getAIMatchResults);

// List all previous matches for a user
app.get('/smart-match/list', listPreviousMatches);

// Fraud detection for creator profiles
app.post('/fraud-detect', detectFraud);

// AI pricing recommendations
app.post('/pricing', getPricingRecommendation);

// Content analysis for creator portfolios
app.post('/content-analysis', analyzeContent);

export default app;
