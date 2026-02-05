import OpenAI from 'openai';
import sharp from 'sharp';
import crypto from 'crypto';
// THIS IS NOW CORRECT
import { client } from '../config/database.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-testing',
});

// Smart Match: AI-Powered Creator Discovery
export const smartMatchCreators = async (c) => {
  try {
const { campaignDescription, targetAudience, budget, niche, brief } = await c.req.json(); // Added 'brief'

    // AI-powered campaign analysis using OpenAI
    const aiAnalysisPrompt = `
      Analyze this influencer marketing campaign and provide insights for creator matching:

      Campaign Description: ${campaignDescription}
      Target Audience: ${targetAudience}
      Budget: ${budget}
      Preferred Niche: ${niche}

      Please provide:
      1. Key campaign requirements and objectives
      2. Ideal creator characteristics (demographics, content style, engagement patterns)
      3. Content strategy recommendations
      4. Success metrics to look for in creator profiles
    `;

    let aiAnalysis = 'AI analysis not available - using fallback matching';
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in influencer marketing and creator-brand partnerships. Analyze campaigns and provide detailed insights for optimal creator matching."
          },
          {
            role: "user",
            content: aiAnalysisPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      aiAnalysis = completion.choices[0].message.content || aiAnalysis;
    } catch (error) {
      console.warn('OpenAI API error, using fallback:', error.message);
    }

    // Query creators with AI-enhanced filtering
    const creators = await client.query(`
      SELECT cp.id, cp.bio, cp.niche, cp.social_links, cp.portfolio_links,
             cp.audience, cp.budget,
             u.email, u.name,
             COALESCE(cp.follower_count, 0) as followers,
             COALESCE(cp.engagement_rate, 0) as engagement_rate
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE (cp.niche ILIKE $1 OR $1 = '')
      ORDER BY cp.engagement_rate DESC, cp.follower_count DESC
      LIMIT 20
    `, [`%${niche}%`]);

    console.log('Query result count:', creators.rows.length);
    console.log('First row:', creators.rows[0]);

    // Calculate match scores using AI analysis
    const scoredCreators = await Promise.all(
      creators.rows.map(async (creator) => {
        // AI-powered scoring using OpenAI for personalized matching
        const scoringPrompt = `
          Rate this creator's suitability for the campaign on a scale of 0-1 (where 1 is perfect match):

          Campaign Details:
          - Description: ${campaignDescription}
          - Target Audience: ${targetAudience}
          - Budget: ${budget}
          - Preferred Niche: ${niche}

          Creator Profile:
          - Niche: ${creator.niche}
          - Bio: ${creator.bio || 'Not provided'}
          - Followers: ${creator.followers || 0}
          - Engagement Rate: ${creator.engagement_rate || 0}%

          Consider:
          - Content relevance to campaign goals
          - Audience alignment with target demographics
          - Creator's ability to deliver campaign objectives
          - Budget appropriateness for creator's reach

          Return only a JSON object with: {"score": number, "explanation": "brief reason"}
        `;

        let matchScore = 0.5; // Base score
        let explanation = `This creator specializes in ${creator.niche} content with ${creator.engagement_rate}% engagement rate.`;

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are an AI matching expert for influencer marketing. Rate creator-campaign compatibility and provide brief explanations. Always return valid JSON."
              },
              {
                role: "user",
                content: scoringPrompt
              }
            ],
            max_tokens: 200,
            temperature: 0.3
          });

          const response = completion.choices[0].message.content || '{"score": 0.5, "explanation": "AI analysis unavailable"}';
          const aiResult = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
          matchScore = Math.max(0, Math.min(1, aiResult.score || 0.5));
          explanation = aiResult.explanation || explanation;
        } catch (error) {
          console.warn('AI scoring failed, using fallback:', error.message);
          // Fallback scoring
          if (creator.engagement_rate > 5) matchScore += 0.2;
          else if (creator.engagement_rate > 2) matchScore += 0.1;

          const budgetNum = parseInt(budget.replace(/[^0-9]/g, ''));
          if (budgetNum > 1000 && creator.followers > 50000) matchScore += 0.2;
          else if (budgetNum < 1000 && creator.followers < 50000) matchScore += 0.1;
        }

        return {
          ...creator,
          matchScore: Math.min(matchScore, 1.0),
          explanation
        };
      })
    );

    // Sort by match score and return top 5
    const topMatches = scoredCreators
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return c.json({ matches: topMatches, aiAnalysis });
  } catch (error) {
    console.error('Smart Match Error:', error);
    return c.json({ error: 'Failed to perform smart matching' }, 500);
  }
};

// Fraud Detection: Analyze Creator Profiles for Authenticity
export const detectFraud = async (c) => {
  try {
    const { creatorId } = await c.req.json();

    const creator = await client.query(`
      SELECT cp.*, u.email
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `, [creatorId]);

    if (creator.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    const profile = creator.rows[0];

    // Analyze social media patterns (simplified version)
    const fraudIndicators = [];

    // Check follower-to-engagement ratio
    if (profile.followers && profile.engagement_rate) {
      const expectedEngagement = Math.max(0.5, 100 / Math.sqrt(profile.followers / 1000));
      if (profile.engagement_rate < expectedEngagement * 0.3) {
        fraudIndicators.push('Unusually low engagement for follower count');
      }
    }

    // Check for suspicious follower growth patterns (mock for now)
    // if (profile.follower_growth_rate && profile.follower_growth_rate > 50) {
    //   fraudIndicators.push('Suspiciously high follower growth rate');
    // }

    // AI-powered fraud detection using OpenAI
    const fraudAnalysisPrompt = `
      Analyze this creator profile for potential fraud or inauthenticity:

      Creator Profile:
      - Followers: ${profile.followers || 0}
      - Engagement Rate: ${profile.engagement_rate || 0}%
      - Niche: ${profile.niche}
      - Bio: ${profile.bio || 'Not provided'}
      - Social Links: ${JSON.stringify(profile.social_links) || 'Not provided'}
      - Portfolio: ${JSON.stringify(profile.portfolio_links) || 'Not provided'}

      Fraud Indicators Found: ${fraudIndicators.join(', ') || 'None'}

      Please analyze:
      1. Authenticity of follower count vs engagement patterns
      2. Consistency between bio and niche
      3. Quality of social media presence
      4. Potential red flags for fake/bot accounts

      Return a JSON object with: {"fraudScore": number (0-1), "riskLevel": "Low/Medium/High", "analysis": "detailed explanation", "recommendations": "any actions needed"}
    `;

    let aiFraudScore = 0.1; // Low base fraud score
    let aiAnalysis = 'Profile appears authentic';
    let riskLevel = 'Low';
    let recommendations = 'No action needed';

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fraud detection expert for social media influencer platforms. Analyze creator profiles for authenticity and provide detailed risk assessments. Always return valid JSON."
          },
          {
            role: "user",
            content: fraudAnalysisPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2
      });

      const response = completion.choices[0].message.content || '{"fraudScore": 0.1, "riskLevel": "Low", "analysis": "AI analysis unavailable", "recommendations": "Manual review recommended"}';
      const aiResult = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));

      aiFraudScore = Math.max(0, Math.min(1, aiResult.fraudScore || 0.1));
      riskLevel = aiResult.riskLevel || 'Low';
      aiAnalysis = aiResult.analysis || aiAnalysis;
      recommendations = aiResult.recommendations || recommendations;
    } catch (error) {
      console.warn('AI fraud detection failed, using basic analysis:', error.message);
      if (fraudIndicators.length > 0) {
        aiFraudScore = Math.min(fraudIndicators.length * 0.2, 0.8);
        aiAnalysis = `Potential fraud indicators detected: ${fraudIndicators.join(', ')}`;
        riskLevel = aiFraudScore > 0.7 ? 'High' : aiFraudScore > 0.4 ? 'Medium' : 'Low';
      }
    }
      const response = completion.choices[0].message.content || '{"fraudScore": 0.1, "riskLevel": "Low", "analysis": "AI analysis unavailable", "recommendations": "Manual review recommended"}';

    // Update fraud score in database
    await client.query(`
      UPDATE creator_profiles
      SET fraud_score = $1, last_fraud_check = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [aiFraudScore, creatorId]);

    return c.json({
      creatorId,
      fraudScore: aiFraudScore,
      riskLevel,
      indicators: fraudIndicators,
      aiAnalysis,
      recommendations,
      verified: aiFraudScore < 0.3
    });
  } catch (error) {
    console.error('Fraud Detection Error:', error);
    return c.json({ error: 'Failed to analyze profile' }, 500);
  }
};


// Save AI Match Results for Campaign and User
export const saveAIMatchResults = async (c) => {
  try {
    const { campaignId, userId, aiMatches, campaignDescription, targetAudience, budget, niche } = await c.req.json();

    if (!userId || !aiMatches) {
      return c.json({ error: 'userId and aiMatches are required' }, 400);
    }

    // Generate search hash for ad-hoc searches (when no campaign_id)
    const searchHash = campaignId 
      ? null 
      : crypto.createHash('md5').update(`${campaignDescription || ''}${targetAudience || ''}${budget || ''}${niche || ''}`).digest('hex');

    // Check if existing record exists
    let existing;
    if (campaignId) {
      existing = await client.query(`
        SELECT id FROM campaign_ai_matches 
        WHERE campaign_id = $1 AND user_id = $2 
        ORDER BY created_at DESC LIMIT 1
      `, [campaignId, userId]);
    } else {
      existing = await client.query(`
        SELECT id FROM campaign_ai_matches 
        WHERE search_hash = $1 AND user_id = $2 
        ORDER BY created_at DESC LIMIT 1
      `, [searchHash, userId]);
    }

    const searchContext = JSON.stringify({
      campaignDescription,
      targetAudience,
      budget,
      niche
    });

    if (existing.rows.length > 0) {
      // Update existing record
      await client.query(`
        UPDATE campaign_ai_matches
        SET ai_matches = $1, search_context = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [JSON.stringify(aiMatches), searchContext, existing.rows[0].id]);
    } else {
      // Insert new record
      await client.query(`
        INSERT INTO campaign_ai_matches (campaign_id, user_id, ai_matches, search_hash, search_context, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campaignId || null, userId, JSON.stringify(aiMatches), searchHash, searchContext]);
    }

    return c.json({ message: 'AI match results saved successfully' });
  } catch (error) {
    console.error('Save AI Match Results Error:', error);
    return c.json({ error: 'Failed to save AI match results' }, 500);
  }
};

// Get latest AI Match Results for Campaign and User
export const getAIMatchResults = async (c) => {
  try {
    const campaignId = c.req.query('campaignId');
    const userId = c.req.query('userId');
    const searchHash = c.req.query('searchHash');

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    let result;
    if (campaignId) {
      result = await client.query(`
        SELECT ai_matches, search_context, created_at FROM campaign_ai_matches
        WHERE campaign_id = $1 AND user_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `, [campaignId, userId]);
    } else if (searchHash) {
      result = await client.query(`
        SELECT ai_matches, search_context, created_at FROM campaign_ai_matches
        WHERE search_hash = $1 AND user_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `, [searchHash, userId]);
    } else {
      return c.json({ error: 'campaignId or searchHash is required' }, 400);
    }

    if (result.rows.length === 0) {
      return c.json({ message: 'No saved AI match results found', aiMatches: [] });
    }

    const row = result.rows[0];
    return c.json({ 
      aiMatches: row.ai_matches, 
      searchContext: row.search_context,
      savedAt: row.created_at 
    });
  } catch (error) {
    console.error('Get AI Match Results Error:', error);
    return c.json({ error: 'Failed to fetch AI match results' }, 500);
  }
};

// List all previous AI matches for a user
export const listPreviousMatches = async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const result = await client.query(`
      SELECT 
        id,
        campaign_id,
        search_hash,
        search_context,
        created_at,
        updated_at,
        jsonb_array_length(ai_matches) as match_count
      FROM campaign_ai_matches
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    const matches = result.rows.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      searchHash: row.search_hash,
      searchContext: row.search_context,
      matchCount: row.match_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return c.json({ matches });
  } catch (error) {
    console.error('List Previous Matches Error:', error);
    return c.json({ error: 'Failed to list previous matches' }, 500);
  }
};

// Get pricing recommendation (stub function)
export const getPricingRecommendation = async (c) => {
  try {
    const { creatorId, campaignBudget } = await c.req.json();
    
    // Placeholder implementation
    return c.json({ 
      recommendedPrice: campaignBudget * 0.8,
      message: 'Pricing recommendation based on campaign budget and creator profile'
    });
  } catch (error) {
    console.error('Pricing Recommendation Error:', error);
    return c.json({ error: 'Failed to get pricing recommendation' }, 500);
  }
};

// Analyze content (stub function)
export const analyzeContent = async (c) => {
  try {
    const { contentUrl, contentType } = await c.req.json();
    
    // Placeholder implementation
    return c.json({ 
      analysis: 'Content analysis not yet implemented',
      quality: 'good',
      message: 'Content analysis feature coming soon'
    });
  } catch (error) {
    console.error('Content Analysis Error:', error);
    return c.json({ error: 'Failed to analyze content' }, 500);
  }
};
