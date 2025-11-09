import { Hono } from 'hono';
import { smartMatchCreators, detectFraud, getPricingRecommendation, analyzeContent } from '../../../controllers/aiController.js';
import { authMiddleware } from '../../../middleware/auth.js';

const aiRoutes = new Hono();

// Apply auth middleware to all AI routes
aiRoutes.use('*', authMiddleware);

// AI-powered creator matching
aiRoutes.post('/smart-match', smartMatchCreators);

// Fraud detection for creator profiles
aiRoutes.post('/fraud-detect', detectFraud);

// AI pricing recommendations
aiRoutes.post('/pricing', getPricingRecommendation);

// Content analysis for creator portfolios
aiRoutes.post('/content-analysis', analyzeContent);

export default aiRoutes;
