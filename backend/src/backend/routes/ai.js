import { Hono } from 'hono';
import { smartMatchCreators, detectFraud, getPricingRecommendation, analyzeContent, saveAIMatchResults, getAIMatchResults, listPreviousMatches } from '../../../controllers/aiController.js';
import { authMiddleware } from '../../../middleware/auth.js';

const aiRoutes = new Hono();

// AI-powered creator matching (public for discovery)
aiRoutes.post('/smart-match', smartMatchCreators); // Accepts campaignDescription, targetAudience, budget, niche and brief.

// Protected routes (require authentication)
aiRoutes.use('*', authMiddleware);

// Save AI match results
aiRoutes.post('/smart-match/save', saveAIMatchResults);

// Continue from previous AI match results
aiRoutes.get('/smart-match/continue', getAIMatchResults);

// List all previous matches for a user
aiRoutes.get('/smart-match/list', listPreviousMatches);

// Fraud detection for creator profiles
aiRoutes.post('/fraud-detect', detectFraud);

// AI pricing recommendations
aiRoutes.post('/pricing', getPricingRecommendation);

// Content analysis for creator portfolios
aiRoutes.post('/content-analysis', analyzeContent);

export default aiRoutes;
