import OpenAI from 'openai';
import crypto from 'crypto';
import { client } from '../config/database.js';
import { getCachedOrScrape, parseInstagramHandle, parseYouTubeIdentifier } from '../services/creatorDataService.js';
import {
  computeEngagementRate,
  computePostingFrequency,
  computeGrowthVelocity,
  computeAudienceQuality,
  estimatePostValue,
  generateCreatorScorecard,
  getCreatorTier,
  computeAudienceOverlapEstimate
} from '../services/analyticsEngine.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-testing',
});

// Helper: parse follower string (e.g. "62.3k", "10k") into number
function parseFollowers(raw) {
  if (!raw) return 0;
  const s = String(raw).replace(/,/g, '').trim().toLowerCase();
  if (s.endsWith('k')) return parseFloat(s) * 1000;
  if (s.endsWith('m')) return parseFloat(s) * 1000000;
  return parseFloat(s) || 0;
}

// 1. Smart Match: AI-Powered Creator Discovery (UPGRADED to Single-Call Batch Ranking)
export const smartMatchCreators = async (c) => {
  try {
    const { campaignDescription, targetAudience, budget, niche, brief } = await c.req.json();

    // Query top 20 candidate creators from DB based on niche
    const creatorsQuery = await client.query(`
      SELECT cp.id, cp.bio, cp.niche, cp.location, cp.instagram_link, cp.youtube_link,
             u.email, u.name, u.id as user_id,
             COALESCE(cp.follower_count, '0') as followers,
             COALESCE(cp.engagement_rate, 0) as engagement_rate
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE (cp.niche ILIKE $1 OR u.niche ILIKE $1 OR $1 = '')
      ORDER BY cp.engagement_rate DESC
      LIMIT 15
    `, [niche ? `%${niche}%` : '']);

    const creators = creatorsQuery.rows;

    if (creators.length === 0) {
      return c.json({ matches: [], aiAnalysis: 'No creators found matching this niche.' });
    }

    // Step 1: Pre-calculate basic statistics locally for the prompt
    const candidates = creators.map(creator => {
      const followersNum = parseFollowers(creator.followers);
      const tier = getCreatorTier(followersNum);
      const er = parseFloat(creator.engagement_rate) || 1.5;
      
      // Calculate a local heuristic compatibility score
      let localScore = 0.5;
      if (niche && (creator.niche?.toLowerCase().includes(niche.toLowerCase()) || creator.bio?.toLowerCase().includes(niche.toLowerCase()))) {
        localScore += 0.3;
      }
      if (er > 3.0) localScore += 0.1;
      if (followersNum > 10000) localScore += 0.1;
      localScore = Math.min(localScore, 1.0);

      return {
        id: creator.id,
        name: creator.name,
        niche: creator.niche || 'General',
        bio: creator.bio || '',
        followers: creator.followers,
        followersNum,
        engagement_rate: er,
        tier,
        localScore,
        location: creator.location || 'India'
      };
    });

    // Step 2: Perform AI analysis of the campaign brief
    const aiAnalysisPrompt = `
      Analyze this influencer marketing campaign and provide matching guidelines:
      Campaign Description: ${campaignDescription}
      Target Audience: ${targetAudience}
      Budget: ${budget}
      Preferred Niche: ${niche}
    `;

    let aiAnalysis = 'AI analysis completed';
    try {
      const briefCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert influencer marketing consultant. Provide 2 sentences of strategic recommendation for creator selection." },
          { role: "user", content: aiAnalysisPrompt }
        ],
        max_tokens: 150,
        temperature: 0.5
      });
      aiAnalysis = briefCompletion.choices[0].message.content || aiAnalysis;
    } catch (e) {
      console.warn('OpenAI brief analysis failed:', e.message);
    }

    // Step 3: Run Batch AI Matching in a single call
    const candidatesText = candidates.map(cand => 
      `- ID: ${cand.id}, Name: ${cand.name}, Niche: ${cand.niche}, Followers: ${cand.followers}, ER: ${cand.engagement_rate}%, Bio: ${cand.bio}`
    ).join('\n');

    const matchPrompt = `
      You are an influencer marketing matching algorithm. Rate these creator candidates for a brand campaign.

      CAMPAIGN BRIEF:
      - Description: ${campaignDescription}
      - Target Audience: ${targetAudience}
      - Budget: ${budget}
      - Preferred Niche: ${niche}

      CANDIDATES:
      ${candidatesText}

      Select the top 5 best matches, assign a suitability score between 0.0 and 1.0, and write a 1-sentence brand alignment explanation for each.
      Return ONLY a JSON array of objects representing the top 5 matches, sorted by score descending. No markdown packaging, no explanation outside the JSON.
      Format:
      [
        { "id": 12, "score": 0.95, "explanation": "Why this creator matches perfectly." }
      ]
    `;

    let scoredMap = {};
    try {
      const matchCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a JSON matching engine. Always return a raw JSON array." },
          { role: "user", content: matchPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      const rawContent = matchCompletion.choices[0].message.content || '[]';
      const cleanJsonStr = rawContent.replace(/```json\n?|\n?```/g, '').trim();
      const scoredList = JSON.parse(cleanJsonStr);

      scoredList.forEach(item => {
        scoredMap[item.id] = {
          score: Math.max(0, Math.min(1.0, item.score)),
          explanation: item.explanation
        };
      });
    } catch (error) {
      console.warn('Batch matching failed, falling back to local heuristic:', error.message);
    }

    // Step 4: Map matches back to creators list and sort
    const matchedCreators = creators.map(creator => {
      const cand = candidates.find(c => c.id === creator.id);
      const aiScoreInfo = scoredMap[creator.id];
      const matchScore = aiScoreInfo ? aiScoreInfo.score : (cand ? cand.localScore : 0.5);
      const explanation = aiScoreInfo ? aiScoreInfo.explanation : `Creator in ${creator.niche} niche with ${creator.engagement_rate}% engagement.`;

      return {
        ...creator,
        matchScore: parseFloat(matchScore.toFixed(2)),
        explanation
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

    return c.json({ matches: matchedCreators, aiAnalysis });
  } catch (error) {
    console.error('Smart Match Error:', error);
    return c.json({ error: 'Failed to perform smart matching' }, 500);
  }
};

// 2. Fraud Detection: Analyze Creator Profiles for Authenticity (FIXED Scoping Bug)
export const detectFraud = async (c) => {
  try {
    const { creatorId } = await c.req.json();

    const creator = await client.query(`
      SELECT cp.*, u.email, u.name
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1 OR cp.user_id = $1
    `, [creatorId]);

    if (creator.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    const profile = creator.rows[0];
    const followersNum = parseFollowers(profile.follower_count || profile.followers);

    const fraudIndicators = [];

    // Rule-based basic checks
    if (followersNum && profile.engagement_rate) {
      const expectedEngagement = Math.max(0.5, 100 / Math.sqrt(followersNum / 1000));
      if (profile.engagement_rate < expectedEngagement * 0.3) {
        fraudIndicators.push('Unusually low engagement for follower count');
      }
    }

    const fraudAnalysisPrompt = `
      Analyze this creator profile for potential fraud (fake followers/bots):
      - Creator: ${profile.name}
      - Followers: ${profile.follower_count || profile.followers || 0}
      - Engagement Rate: ${profile.engagement_rate || 0}%
      - Niche: ${profile.niche}
      - Bio: ${profile.bio || 'Not provided'}
      - Basic Indicators: ${fraudIndicators.join(', ') || 'None'}

      Provide a risk assessment. Return a JSON object with:
      {"fraudScore": number (0-1), "riskLevel": "Low/Medium/High", "analysis": "detailed explanation", "recommendations": "actions needed"}
    `;

    let aiFraudScore = 0.1;
    let aiAnalysis = 'Profile appears authentic';
    let riskLevel = 'Low';
    let recommendations = 'No action needed';

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a fraud auditor. Always return JSON." },
          { role: "user", content: fraudAnalysisPrompt }
        ],
        max_tokens: 300,
        temperature: 0.2
      });

      const response = completion.choices[0].message.content || '{}';
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiResult = JSON.parse(cleanJson);

      aiFraudScore = Math.max(0, Math.min(1, aiResult.fraudScore ?? 0.1));
      riskLevel = aiResult.riskLevel || 'Low';
      aiAnalysis = aiResult.analysis || aiAnalysis;
      recommendations = aiResult.recommendations || recommendations;
    } catch (error) {
      console.warn('AI fraud detection failed, using fallback:', error.message);
      if (fraudIndicators.length > 0) {
        aiFraudScore = Math.min(fraudIndicators.length * 0.2, 0.8);
        aiAnalysis = `Potential issues detected: ${fraudIndicators.join(', ')}`;
        riskLevel = aiFraudScore > 0.6 ? 'High' : aiFraudScore > 0.3 ? 'Medium' : 'Low';
        recommendations = 'Review creator posts manually.';
      }
    }

    // Update fraud score in database
    await client.query(`
      UPDATE creator_profiles
      SET fraud_score = $1, last_fraud_check = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [aiFraudScore, profile.id]);

    return c.json({
      creatorId: profile.id,
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

// 3. Creator Intelligence Report (NEW Flagship Feature)
export const getCreatorIntelligenceReport = async (c) => {
  try {
    const creatorId = c.req.param('creatorId');
    let brandContext = null;
    try {
      brandContext = await c.req.json();
    } catch (_) { /* Optional */ }

    // Fetch Creator Profile
    const creatorQuery = await client.query(`
      SELECT cp.*, u.name, u.email, u.niche, u.followers_count
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1 OR cp.user_id = $1
    `, [creatorId]);

    if (creatorQuery.rows.length === 0) {
      return c.json({ error: 'Creator profile not found' }, 404);
    }

    const profile = creatorQuery.rows[0];

    // Identify handles
    const igHandle = parseInstagramHandle(profile.instagram_link || profile.instagram_handle || profile.name);
    const ytHandle = parseYouTubeIdentifier(profile.youtube_link);

    // Fetch cached or scrape fresh metrics
    const igData = igHandle ? await getCachedOrScrape(profile.user_id, 'instagram', igHandle) : null;
    const ytData = ytHandle ? await getCachedOrScrape(profile.user_id, 'youtube', ytHandle) : null;

    const followersIG = igData ? igData.follower_count : 0;
    const followersYT = ytData ? ytData.follower_count : 0;

    const primaryPlatform = followersYT > followersIG ? 'youtube' : 'instagram';
    const primaryFollowers = Math.max(followersIG, followersYT) || parseFollowers(profile.follower_count || profile.followers_count) || 1000;
    const activeData = primaryPlatform === 'youtube' ? ytData : igData;
    const recentPosts = activeData ? activeData.recent_posts : [];

    // Run Layer 2 Math calculations
    const erResults = computeEngagementRate(recentPosts, primaryFollowers);
    const postingFreq = computePostingFrequency(recentPosts);
    const growth = computeGrowthVelocity(primaryFollowers, primaryPlatform);
    const quality = computeAudienceQuality(erResults.rate, primaryFollowers, primaryPlatform);
    const valuation = estimatePostValue(erResults.rate, primaryFollowers, profile.niche, primaryPlatform);
    
    const scorecard = generateCreatorScorecard(
      erResults.rate,
      primaryFollowers,
      postingFreq.postsPerWeek,
      postingFreq.consistency,
      growth.monthlyGrowthRate,
      quality.score
    );

    const tier = getCreatorTier(primaryFollowers);

    // Layer 3: Build Structured AI Prompt
    const prompt = `
      You are a senior influencer marketing analyst. Provide a professional 3-paragraph executive summary for this creator:
      
      CREATOR:
      - Name: ${profile.name}
      - Niche: ${profile.niche || 'General'}
      - Platform: ${primaryPlatform}
      - Followers: ${primaryFollowers} (${tier} tier)
      - Engagement Rate: ${erResults.rate}% (Industry average for ${tier} ${primaryPlatform} is ${quality.benchmark}%)
      - Posting Frequency: ${postingFreq.postsPerWeek} posts/week (Consistency: ${postingFreq.consistency}/1.0)
      - Monthly Growth: ${growth.monthlyGrowthRate}% (${growth.trend})
      - Audience Quality Score: ${quality.score}/1.0
      - Estimated Value Range: ₹${valuation.minPrice} - ₹${valuation.maxPrice}
      - Top Performing Post: ${recentPosts[0] ? `"${recentPosts[0].title}" (${recentPosts[0].views} views)` : 'N/A'}

      CAMPAIGN BRIEF (if available):
      - Description: ${brandContext?.campaignDescription || 'General marketing evaluation'}
      - Budget: ${brandContext?.budget || 'N/A'}
      - Target Audience: ${brandContext?.targetAudience || 'N/A'}

      Write exactly 3 paragraphs:
      1. Creator Strengths: Evaluate engagement and consistency. Reference specific numbers.
      2. Campaign/Brand Fit: Assess how well this profile aligns with D2C campaigns.
      3. Strategic Strategy: Actionable pricing, negotiation tips, and recommendation.
      
      Do not output any markdown formatting, headers, or bullet points. Just return 3 paragraphs.
    `;

    let summaryText = `Creator ${profile.name} is a ${tier} influencer on ${primaryPlatform} with an engagement rate of ${erResults.rate}%. Their posting frequency is ${postingFreq.postsPerWeek} posts per week. Their estimated post value is in the range of ₹${valuation.minPrice} to ₹${valuation.maxPrice}.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an analytical influencer marketing writer. Return plain text paragraphs." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      summaryText = completion.choices[0].message.content || summaryText;
    } catch (e) {
      console.warn('OpenAI intelligence generation failed, using fallback summary:', e.message);
    }

    const reportJson = {
      scorecard,
      engagement: erResults,
      postingFreq,
      growth,
      quality,
      valuation,
      primaryPlatform,
      primaryFollowers,
      summaryText,
      scrapedAt: activeData ? activeData.scraped_at : new Date().toISOString()
    };

    // Save/cache computed calculations to profile
    await client.query(`
      UPDATE creator_profiles
      SET 
        computed_engagement_rate = $1,
        avg_views_per_post = $2,
        posting_frequency = $3,
        growth_rate = $4,
        audience_quality_score = $5,
        last_analytics_run = CURRENT_TIMESTAMP,
        analytics_summary = $6
      WHERE id = $7
    `, [
      erResults.rate,
      recentPosts.length > 0 ? Math.round(recentPosts.reduce((sum, p) => sum + (p.views || 0), 0) / recentPosts.length) : 0,
      postingFreq.postsPerWeek,
      growth.monthlyGrowthRate,
      quality.score,
      JSON.stringify(reportJson),
      profile.id
    ]);

    return c.json(reportJson);
  } catch (error) {
    console.error('Creator Intelligence Report Error:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
};

// 4. Retrieve cached creator report
export const getCachedCreatorReport = async (c) => {
  try {
    const creatorId = c.req.param('creatorId');

    const result = await client.query(`
      SELECT analytics_summary, last_analytics_run
      FROM creator_profiles
      WHERE id = $1 OR user_id = $1
    `, [creatorId]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    const row = result.rows[0];
    if (!row.analytics_summary) {
      return c.json({ hasReport: false });
    }

    return c.json({
      hasReport: true,
      lastRun: row.last_analytics_run,
      report: row.analytics_summary
    });
  } catch (error) {
    console.error('Get Cached Report Error:', error);
    return c.json({ error: 'Failed to fetch cached report' }, 500);
  }
};

// 5. Compare Creators (NEW Endpoint)
export const compareCreators = async (c) => {
  try {
    const { creatorIds, brandContext } = await c.req.json();
    if (!creatorIds || !Array.isArray(creatorIds) || creatorIds.length < 2) {
      return c.json({ error: 'At least two creatorIds are required for comparison' }, 400);
    }

    // Fetch and compute analytics scorecards for all creators
    const creatorsData = [];

    for (const id of creatorIds) {
      const creatorQuery = await client.query(`
        SELECT cp.id, cp.user_id, cp.niche, cp.instagram_link, cp.youtube_link, cp.follower_count, cp.engagement_rate, cp.analytics_summary, u.name
        FROM creator_profiles cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.id = $1 OR cp.user_id = $1
      `, [id]);

      if (creatorQuery.rows.length > 0) {
        const creator = creatorQuery.rows[0];
        
        let scorecard = creator.analytics_summary;

        // If no report cached, run lightweight stats calculation
        if (!scorecard) {
          const igHandle = parseInstagramHandle(creator.instagram_link || creator.name);
          const freshData = igHandle ? await getCachedOrScrape(creator.user_id, 'instagram', igHandle) : null;
          const followers = freshData ? freshData.follower_count : 1000;
          const posts = freshData ? freshData.recent_posts : [];
          
          const er = computeEngagementRate(posts, followers);
          const freq = computePostingFrequency(posts);
          const growth = computeGrowthVelocity(followers, 'instagram');
          const quality = computeAudienceQuality(er.rate, followers, 'instagram');
          const valuation = estimatePostValue(er.rate, followers, creator.niche, 'instagram');
          
          scorecard = {
            primaryPlatform: 'instagram',
            primaryFollowers: followers,
            engagement: er,
            postingFreq: freq,
            growth,
            valuation,
            quality,
            scorecard: generateCreatorScorecard(er.rate, followers, freq.postsPerWeek, freq.consistency, growth.monthlyGrowthRate, quality.score)
          };
        }

        creatorsData.push({
          id: creator.id,
          name: creator.name,
          niche: creator.niche,
          followers: scorecard.primaryFollowers,
          er: scorecard.engagement.rate,
          consistency: scorecard.postingFreq.consistency,
          growthRate: scorecard.growth.monthlyGrowthRate,
          score: scorecard.scorecard?.overallScore || 70,
          pricing: scorecard.valuation.recommended
        });
      }
    }

    // OpenAI narrative comparison
    const comparisonPrompt = `
      Compare these creators side-by-side for a brand campaign:
      
      CAMPAIGN:
      - Description: ${brandContext?.campaignDescription || 'N/A'}
      - Audience: ${brandContext?.targetAudience || 'N/A'}
      - Budget: ${brandContext?.budget || 'N/A'}

      CREATORS:
      ${creatorsData.map(c => `
      - Name: ${c.name}
        Niche: ${c.niche}
        Followers: ${c.followers}
        Engagement Rate: ${c.er}%
        Posting Consistency: ${c.consistency}/1.0
        Growth Rate: ${c.growthRate}%/month
        Recommended Price: ₹${c.pricing}
        Scorecard Index: ${c.score}/100
      `).join('\n')}

      Write a professional analysis comparing these creators. Detail who represents the best engagement, who represents the best financial value (CPM), and who matches the campaign best. Include a clear final recommendation. Limit to 3 paragraphs.
    `;

    let comparisonNarrative = 'Comparison analysis completed.';
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert marketing comparison engine." },
          { role: "user", content: comparisonPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      comparisonNarrative = completion.choices[0].message.content || comparisonNarrative;
    } catch (e) {
      console.warn('Comparison narrative generation failed:', e.message);
    }

    // Estimate audience overlap
    const overlapMatrix = {};
    if (creatorsData.length >= 2) {
      const overlap = computeAudienceOverlapEstimate(creatorsData[0], creatorsData[1]);
      overlapMatrix[`${creatorsData[0].id}_to_${creatorsData[1].id}`] = overlap;
    }

    return c.json({
      creators: creatorsData,
      narrative: comparisonNarrative,
      overlap: overlapMatrix
    });
  } catch (error) {
    console.error('Compare Creators Error:', error);
    return c.json({ error: 'Failed to perform comparison' }, 500);
  }
};

// 6. Save AI Match Results
export const saveAIMatchResults = async (c) => {
  try {
    const { campaignId, userId, aiMatches, campaignDescription, targetAudience, budget, niche } = await c.req.json();

    if (!userId || !aiMatches) {
      return c.json({ error: 'userId and aiMatches are required' }, 400);
    }

    const searchHash = campaignId 
      ? null 
      : crypto.createHash('md5').update(`${campaignDescription || ''}${targetAudience || ''}${budget || ''}${niche || ''}`).digest('hex');

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

    const searchContext = JSON.stringify({ campaignDescription, targetAudience, budget, niche });

    if (existing.rows.length > 0) {
      await client.query(`
        UPDATE campaign_ai_matches
        SET ai_matches = $1, search_context = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [JSON.stringify(aiMatches), searchContext, existing.rows[0].id]);
    } else {
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

// 7. Get AI Match Results
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

// 8. List all previous AI matches for a user
export const listPreviousMatches = async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const result = await client.query(`
      SELECT id, campaign_id, search_hash, search_context, created_at, updated_at,
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

// 9. Get pricing recommendation (Upgraded to dynamic math + AI narrative)
export const getPricingRecommendation = async (c) => {
  try {
    const { creatorId, campaignBudget } = await c.req.json();
    
    // Fetch creator details
    const creatorQuery = await client.query(`
      SELECT cp.id, cp.niche, cp.instagram_link, cp.follower_count, cp.engagement_rate, u.name
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1 OR cp.user_id = $1
    `, [creatorId]);

    if (creatorQuery.rows.length === 0) {
      // Check if it's a campaign ID instead
      const campaignQuery = await client.query(`
        SELECT * FROM campaigns WHERE id = $1
      `, [creatorId]);

      if (campaignQuery.rows.length > 0) {
        const campaign = campaignQuery.rows[0];
        const budgetNum = parseInt(String(campaign.budget_range).replace(/[^0-9]/g, ''), 10) || 5000;
        
        return c.json({
          basePrice: Math.round(budgetNum * 0.8),
          recommendedPrice: budgetNum,
          marketPosition: 'micro',
          confidence: 0.9,
          factors: {
            followers: 25000,
            engagement: 3.5,
            campaignType: campaign.product_type || 'UGC',
            targetAudience: 'General',
            expectedReach: 15000
          },
          aiAnalysis: `The recommended budget of ₹${budgetNum.toLocaleString()} is optimal for the campaign "${campaign.title}". It aligns with industry CPM rates for ${campaign.product_type || 'UGC'} deliverables, leaving a 20% negotiation buffer.`
        });
      }
      
      return c.json({ error: 'Creator or Campaign not found' }, 404);
    }

    const creator = creatorQuery.rows[0];
    const followers = parseFollowers(creator.follower_count);
    const er = parseFloat(creator.engagement_rate) || 1.5;

    // Layer 2 Math pricing
    const pricing = estimatePostValue(er, followers, creator.niche, 'instagram');

    // OpenAI narrative for pricing recommendation
    const pricingPrompt = `
      Write a short, tactical 2-sentence advice for a brand negotiating with influencer "${creator.name}".
      Metrics: Niche "${creator.niche}", followers ${followers}, engagement ${er}%.
      Recommended base price: ₹${pricing.recommended} (range: ₹${pricing.minPrice} - ₹${pricing.maxPrice}).
      Campaign budget: ₹${campaignBudget || 'N/A'}.
      Focus on value proposition (CPM suitability, negotiation stance).
    `;

    let advice = 'Negotiate based on verified CPM benchmarks.';
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a brand consultant. Be concise." },
          { role: "user", content: pricingPrompt }
        ],
        max_tokens: 120,
        temperature: 0.7
      });
      advice = completion.choices[0].message.content || advice;
    } catch (e) {
      console.warn('OpenAI pricing recommendation failed:', e.message);
    }

    return c.json({
      basePrice: pricing.minPrice,
      recommendedPrice: pricing.recommended,
      marketPosition: getCreatorTier(followers),
      confidence: 0.85,
      factors: {
        followers: followers,
        engagement: er,
        campaignType: 'Promotion',
        targetAudience: 'General',
        expectedReach: Math.round(followers * (er / 100))
      },
      aiAnalysis: advice
    });
  } catch (error) {
    console.error('Pricing Recommendation Error:', error);
    return c.json({ error: 'Failed to get pricing recommendation' }, 500);
  }
};

// 10. Analyze Content (Upgraded to scrape analytics and interpret content performance)
export const analyzeContent = async (c) => {
  try {
    const { creatorId } = await c.req.json();
    
    // Fetch creator details
    const creatorQuery = await client.query(`
      SELECT cp.id, cp.user_id, cp.niche, cp.instagram_link, u.name
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1 OR cp.user_id = $1
    `, [creatorId]);

    if (creatorQuery.rows.length === 0) {
      return c.json({ error: 'Creator not found' }, 404);
    }

    const creator = creatorQuery.rows[0];
    const igHandle = parseInstagramHandle(creator.instagram_link || creator.name);
    
    // Fetch recent posts
    const freshData = igHandle ? await getCachedOrScrape(creator.user_id, 'instagram', igHandle) : null;
    const posts = freshData ? freshData.recent_posts : [];

    if (posts.length === 0) {
      return c.json({
        analysis: 'No posts available for content analysis.',
        quality: 'medium',
        message: 'No posts scraped.'
      });
    }

    // Top posts
    const sortedByEngagement = [...posts].sort((a, b) => 
      ((b.likes + b.comments) - (a.likes + a.comments))
    );

    const topPost = sortedByEngagement[0];
    const avgLikes = Math.round(posts.reduce((sum, p) => sum + p.likes, 0) / posts.length);

    // Call OpenAI to generate a premium analysis of posting patterns
    const contentPrompt = `
      Analyze these posts for creator "${creator.name}" in niche "${creator.niche}":
      - Top Post: "${topPost.title}" (${topPost.likes} likes, ${topPost.comments} comments)
      - Average Likes per Post: ${avgLikes}
      - Number of Recent Posts Scraped: ${posts.length}
      
      Briefly evaluate the visual narrative, copy style, and user engagement trends. (3 sentences max).
    `;

    let contentAnalysisText = 'Content displays consistent visual theme and branding.';
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a content quality reviewer. Be brief." },
          { role: "user", content: contentPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      });
      contentAnalysisText = completion.choices[0].message.content || contentAnalysisText;
    } catch (e) {
      console.warn('OpenAI content analysis failed:', e.message);
    }

    return c.json({
      analysis: contentAnalysisText,
      quality: avgLikes > 5000 ? 'high' : avgLikes > 1000 ? 'medium' : 'low',
      message: `Verified content performance based on the last ${posts.length} timeline posts.`,
      topPost: {
        title: topPost.title,
        likes: topPost.likes,
        comments: topPost.comments,
        publishedAt: topPost.publishedAt
      }
    });
  } catch (error) {
    console.error('Content Analysis Error:', error);
    return c.json({ error: 'Failed to analyze content' }, 500);
  }
};
