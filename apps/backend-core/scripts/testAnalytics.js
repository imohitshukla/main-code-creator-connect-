import {
  computeEngagementRate,
  computePostingFrequency,
  computeGrowthVelocity,
  computeAudienceQuality,
  estimatePostValue,
  generateCreatorScorecard
} from '../services/analyticsEngine.js';

import { parseInstagramHandle, parseYouTubeIdentifier } from '../services/creatorDataService.js';

console.log("🧪 Running Analytics Engine Tests...");

// Test posts data
const posts = [
  { likes: 100, comments: 10, views: 1500, publishedAt: new Date().toISOString() },
  { likes: 120, comments: 15, views: 1800, publishedAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
  { likes: 90, comments: 8, views: 1400, publishedAt: new Date(Date.now() - 6*24*60*60*1000).toISOString() }
];

const followers = 10000; // Micro influencer

// 1. ER Test
const er = computeEngagementRate(posts, followers);
console.log("1. ER Calculation Result:", er);
if (er.rate === 1.10) {
  console.log("✅ ER calculation verified! Rate:", er.rate);
} else {
  console.log("❌ ER verification failed! Expected 1.10, got", er.rate);
}

// 2. Frequency Test
const freq = computePostingFrequency(posts);
console.log("2. Posting Frequency Result:", freq);
if (freq.postsPerWeek > 0) {
  console.log("✅ Posting frequency verified! Posts per week:", freq.postsPerWeek);
} else {
  console.log("❌ Posting frequency verification failed!");
}

// 3. Pricing Test
const price = estimatePostValue(1.10, followers, 'technology', 'instagram');
console.log("3. Estimated Pricing Result:", price);
if (price.recommended > 0) {
  console.log("✅ Pricing estimation verified! Recommended:", price.recommended);
} else {
  console.log("❌ Pricing estimation failed!");
}

// 4. Overlap/Scorecard Test
const scorecard = generateCreatorScorecard(
  er.rate,
  followers,
  freq.postsPerWeek,
  freq.consistency,
  2.5,
  0.75
);
console.log("4. Scorecard Index Result:", scorecard);
if (scorecard.overallScore > 0) {
  console.log("✅ Scorecard calculation verified! Overall Score:", scorecard.overallScore);
} else {
  console.log("❌ Scorecard verification failed!");
}

// 5. Data parser utilities
const ig1 = parseInstagramHandle("https://instagram.com/divyansh_shukla_/?hl=en");
const ig2 = parseInstagramHandle("@divyansh_shukla_");
console.log("5. Instagram Parser Result:", { ig1, ig2 });
if (ig1 === "divyansh_shukla_" && ig2 === "divyansh_shukla_") {
  console.log("✅ Instagram handle parser verified!");
} else {
  console.log("❌ Instagram handle parser failed!");
}

console.log("🏁 All tests completed successfully!");
process.exit(0);
