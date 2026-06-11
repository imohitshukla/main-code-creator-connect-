// Industry Benchmarks by Platform and Creator Tier
// Nano: <10k, Micro: 10k-50k, Mid: 50k-100k, Macro: 100k-500k, Mega: 500k+
export const ENGAGEMENT_BENCHMARKS = {
  instagram: { nano: 5.0, micro: 3.5, mid: 2.0, macro: 1.2, mega: 0.8 },
  youtube:   { nano: 8.0, micro: 5.5, mid: 3.0, macro: 1.8, mega: 1.0 }
};

// CPM (Cost Per Mille / Thousand views/reach) Benchmarks in INR by Niche
export const NICHE_CPM_INR = {
  fitness:    { min: 15, max: 25 },
  technology: { min: 20, max: 35 },
  fashion:    { min: 10, max: 20 },
  nutrition:  { min: 18, max: 28 },
  photography:{ min: 15, max: 25 },
  gaming:     { min: 8,  max: 18 },
  travel:     { min: 15, max: 28 },
  lifestyle:  { min: 10, max: 20 },
  general:    { min: 10, max: 20 }
};

/**
 * Determines creator tier based on follower count
 */
export function getCreatorTier(followers) {
  const f = parseInt(followers, 10) || 0;
  if (f < 10000) return 'nano';
  if (f < 50000) return 'micro';
  if (f < 100000) return 'mid';
  if (f < 500000) return 'macro';
  return 'mega';
}

/**
 * Computes median and standard deviation of engagement rates across posts,
 * including view-based rates and engagement volatility.
 */
export function computeEngagementRate(posts, followers) {
  const fCount = parseInt(followers, 10) || 1000;
  if (!posts || posts.length === 0) {
    return { rate: 0, median: 0, stddev: 0, followerER: 0, viewBasedER: 0, volatility: 0 };
  }

  const rates = [];
  const viewRates = [];
  const engagementsList = [];

  posts.forEach(post => {
    const likes = parseInt(post.likes, 10) || 0;
    const comments = parseInt(post.comments, 10) || 0;
    const engagements = likes + comments;
    const views = parseInt(post.views, 10) || 0;

    engagementsList.push(engagements);
    rates.push((engagements / fCount) * 100);

    if (views > 0) {
      viewRates.push((engagements / views) * 100);
    } else {
      // Modern safety fallback: if views are 0 or not tracked, assume an organic 10x reach multiplier
      viewRates.push((engagements / Math.max(1, engagements * 10)) * 100);
    }
  });

  // Median Follower-based ER
  const sorted = [...rates].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Median View-based ER
  const sortedViews = [...viewRates].sort((a, b) => a - b);
  const midView = Math.floor(sortedViews.length / 2);
  const medianViewRate = sortedViews.length % 2 !== 0 ? sortedViews[midView] : (sortedViews[midView - 1] + sortedViews[midView]) / 2;

  // Engagements Mean & Standard Deviation (Volatility metric)
  const sumEng = engagementsList.reduce((a, b) => a + b, 0);
  const meanEng = sumEng / engagementsList.length;

  const sqDiffSum = engagementsList.reduce((a, b) => a + Math.pow(b - meanEng, 2), 0);
  const engStddev = Math.sqrt(sqDiffSum / engagementsList.length);

  // Volatility coefficient: standard deviation / mean (organic consistency index)
  const volatility = meanEng > 0 ? (engStddev / meanEng) : 0;

  // ER standard deviation for backwards compatibility
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const erSqDiffSum = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
  const stddev = Math.sqrt(erSqDiffSum / rates.length);

  return {
    rate: parseFloat(median.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    stddev: parseFloat(stddev.toFixed(2)),
    followerER: parseFloat(median.toFixed(2)),
    viewBasedER: parseFloat(medianViewRate.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(3))
  };
}

/**
 * Calculates posting frequency and consistency over the last 90 days
 */
export function computePostingFrequency(posts) {
  if (!posts || posts.length === 0) {
    return { postsPerWeek: 0, consistency: 0 };
  }

  // Filter posts in the last 90 days
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  
  const recentPosts = posts.filter(p => {
    const pubDate = new Date(p.publishedAt).getTime();
    return pubDate >= ninetyDaysAgo;
  });

  if (recentPosts.length === 0) {
    return { postsPerWeek: 0, consistency: 0 };
  }

  // Group by week (13 weeks total in 90 days)
  const weeks = Array(13).fill(0);
  recentPosts.forEach(p => {
    const pubDate = new Date(p.publishedAt).getTime();
    const diffMs = now - pubDate;
    const weekIdx = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    if (weekIdx >= 0 && weekIdx < 13) {
      weeks[weekIdx]++;
    }
  });

  const sum = weeks.reduce((a, b) => a + b, 0);
  const mean = sum / 13;

  // Standard deviation of weekly post counts
  const sqDiffSum = weeks.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
  const stddev = Math.sqrt(sqDiffSum / 13);

  // Coefficient of variation (CV) = stddev / mean. Low CV means high consistency.
  const cv = mean > 0 ? stddev / mean : 1.0;
  
  // Consistency score: 1 is perfectly consistent, 0 is highly erratic
  const consistencyScore = Math.max(0, 1 - cv);

  return {
    postsPerWeek: parseFloat((mean).toFixed(1)),
    consistency: parseFloat(consistencyScore.toFixed(2))
  };
}

/**
 * Computes growth velocity (monthly follower growth rate)
 */
export function computeGrowthVelocity(currentFollowers, platform) {
  const f = parseInt(currentFollowers, 10) || 1000;
  const tier = getCreatorTier(f);
  
  // Standard/Expected growth velocities based on tier as fallback
  const tierGrowthRates = {
    nano: 4.5,
    micro: 3.2,
    mid: 2.2,
    macro: 1.5,
    mega: 0.9
  };

  const baseGrowth = tierGrowthRates[tier] || 1.5;

  return {
    monthlyGrowthRate: baseGrowth,
    trend: baseGrowth > 3.0 ? 'accelerating' : baseGrowth > 1.5 ? 'steady' : 'stable'
  };
}

/**
 * Calculates audience quality score relative to platform/tier benchmarks,
 * penalizing robotic/bot profiles using engagement volatility.
 */
export function computeAudienceQuality(engagementRate, followers, platform, volatility = 0.3) {
  const er = parseFloat(engagementRate) || 0;
  const f = parseInt(followers, 10) || 0;
  const tier = getCreatorTier(f);
  const p = platform || 'instagram';

  const benchmark = ENGAGEMENT_BENCHMARKS[p]?.[tier] || 2.0;

  // Normalize engagement rate relative to industry benchmark
  let score = 0.5 + (er / (benchmark * 2)) * 0.5;
  score = Math.max(0.1, Math.min(1.0, score));

  // Volatility Penalty (bot auditing):
  // Volatility > 1.2 suggests inorganic bot spikes or random viral hits.
  // Volatility < 0.05 suggests artificial / robotic consistency (bot farm comments).
  let volatilityMultiplier = 1.0;
  if (volatility > 1.2) {
    volatilityMultiplier = Math.max(0.7, 1.2 - (volatility - 1.2) * 0.5);
  } else if (volatility < 0.05 && volatility > 0) {
    volatilityMultiplier = Math.max(0.6, 0.2 + volatility * 8);
  }

  return {
    score: parseFloat((score * volatilityMultiplier).toFixed(2)),
    tier: tier,
    benchmark: benchmark,
    volatility: parseFloat(volatility.toFixed(3))
  };
}

/**
 * Heuristically estimates post valuation in INR based on followers, engagement rate, and niche
 */
export function estimatePostValue(engagementRate, followers, niche, platform) {
  const er = parseFloat(engagementRate) || 1.5;
  const f = parseInt(followers, 10) || 1000;
  const p = platform || 'instagram';
  const tier = getCreatorTier(f);
  
  const cleanNiche = String(niche || 'general').trim().toLowerCase();
  const cpm = NICHE_CPM_INR[cleanNiche] || NICHE_CPM_INR.general;
  const benchmark = ENGAGEMENT_BENCHMARKS[p]?.[tier] || 2.0;

  // Multiplier based on engagement performance (reward high engagement, adjust down for low)
  const performanceMultiplier = Math.max(0.5, Math.min(2.0, er / benchmark));

  // Base pricing based on follower count and CPM
  // Post value = Followers * (CPM / 1000) * performanceMultiplier
  const minVal = f * (cpm.min / 1000) * performanceMultiplier;
  const maxVal = f * (cpm.max / 1000) * performanceMultiplier;
  const recommendedVal = f * (((cpm.min + cpm.max) / 2) / 1000) * performanceMultiplier;

  // Apply sensible minimum bounds for nano influencers
  const bound = (val) => Math.max(500, Math.round(val / 100) * 100);

  return {
    minPrice: bound(minVal),
    maxPrice: bound(maxVal),
    recommended: bound(recommendedVal)
  };
}

/**
 * Generates an overall composite score out of 100 using advanced multi-dimensional weights.
 */
export function generateCreatorScorecard(engagementRate, followers, postsPerWeek, consistency, growthRate, qualityScore, viewBasedER = 0, volatility = 0.3) {
  const er = parseFloat(engagementRate) || 0;
  const f = parseInt(followers, 10) || 1000;
  const freq = parseFloat(postsPerWeek) || 0;
  const cons = parseFloat(consistency) || 0;
  const growth = parseFloat(growthRate) || 0;
  const quality = parseFloat(qualityScore) || 0.5;

  // Convert individual metrics to sub-scores out of 100
  const erSub = Math.min(100, (er / 5.0) * 100); // 5% Follower ER is considered a perfect sub-score
  const freqSub = Math.min(100, (freq / 3.0) * 100); // 3 posts/week is a perfect sub-score
  const consSub = cons * 100;
  const growthSub = Math.min(100, (growth / 5.0) * 100); // 5% monthly growth is a perfect sub-score
  const qualitySub = quality * 100;

  // View-based ER: a view-based ER of 4.5% is considered healthy/perfect
  const targetViewER = viewBasedER || (er * 8); 
  const viewSub = Math.min(100, (targetViewER / 4.5) * 100);

  // Consistency and Volatility score
  let volatilitySub = 100;
  if (volatility > 0.8) {
    volatilitySub = Math.max(30, 100 - (volatility - 0.8) * 80);
  } else if (volatility < 0.08 && volatility > 0) {
    volatilitySub = Math.max(20, volatility * 1000);
  }

  // Combined stability subscore
  const stabilitySub = (consSub * 0.6) + (volatilitySub * 0.4);

  // New Weighted composite for the most accuracy (state-of-the-art modeling):
  // 1. Follower-based ER (25%)
  // 2. View-based ER (15%)
  // 3. Stability & Consistency (20%)
  // 4. Growth Velocity (15%)
  // 5. Audience Quality (25%)
  const score = (erSub * 0.25) + (viewSub * 0.15) + (stabilitySub * 0.20) + (growthSub * 0.15) + (qualitySub * 0.25);

  return {
    overallScore: Math.round(Math.max(10, Math.min(100, score))),
    breakdown: {
      engagement: Math.round((erSub * 0.6) + (viewSub * 0.4)),
      consistency: Math.round(stabilitySub),
      growth: Math.round(growthSub),
      quality: Math.round(qualitySub)
    }
  };
}

/**
 * Heuristic audience overlap estimator between two creators
 */
export function computeAudienceOverlapEstimate(creatorA, creatorB) {
  if (!creatorA || !creatorB) {
    return { overlapPercent: 0, confidence: 'low' };
  }

  const nicheA = String(creatorA.niche || '').trim().toLowerCase();
  const nicheB = String(creatorB.niche || '').trim().toLowerCase();
  const locA = String(creatorA.location || '').trim().toLowerCase();
  const locB = String(creatorB.location || '').trim().toLowerCase();

  let baseOverlap = 5; // Base minimal overlap for standard audiences on same platform

  if (nicheA === nicheB && nicheA !== '') {
    baseOverlap += 15;
  }
  if (locA === locB && locA !== '') {
    baseOverlap += 10;
  }

  // Adjust for size differences (highly asymmetric sizes have smaller overlap for the larger creator)
  const folA = parseInt(creatorA.followers, 10) || 1000;
  const folB = parseInt(creatorB.followers, 10) || 1000;
  const ratio = Math.min(folA, folB) / Math.max(folA, folB);
  
  const finalOverlap = Math.round(baseOverlap * ratio + (nicheA === nicheB ? 5 : 0));
  
  return {
    overlapPercent: Math.max(2, Math.min(45, finalOverlap)),
    confidence: ratio > 0.5 ? 'medium' : 'low'
  };
}
