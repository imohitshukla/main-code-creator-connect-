# The Pulse Engine — Isolated Data Science Microservice

The Pulse Engine is an isolated, self-contained analytical microservice responsible for clinical audience health audits of creator profiles. It is intentionally decoupled from the main business logic in `apps/backend-core`.

## Architecture

```
services/pulse-engine/
├── analytical-models/       ← Python analytical core
│   └── pulse_analyzer.py    ← XGBoost + VADER + BERT + DVI calculations
├── ml-models/               ← Trained ML model artifacts
│   ├── xgboost_bot_model.pkl   ← Trained XGBoost bot-detection classifier
│   ├── train_models.py         ← Training script
│   ├── generate_dataset.py     ← Dataset generation from CSV
│   └── fake_instagram_profile.csv  ← Labeled training dataset
├── scrapers/                ← Data ingestion layer
│   ├── creatorDataService.js   ← RapidAPI scraper + PostgreSQL cache
│   └── README.md
├── api/
│   └── pulseController.js   ← Hono.js handler — orchestrates all 3 layers
└── requirements.txt         ← Python dependencies
```

## Three-Layer Execution Model

| Layer | Technology | Purpose |
|---|---|---|
| **Layer 1** — Ingest | `creatorDataService.js` (Node.js) | Scrape & cache Instagram/YouTube profiles |
| **Layer 2** — Analyze | `pulse_analyzer.py` (Python) | Bot detection, sentiment NLP, DVI, cross-platform |
| **Layer 3** — Narrate | GPT-4o (OpenAI) | Clinical 3-part audit report generation |

## Python Setup

```bash
cd services/pulse-engine
pip install -r requirements.txt
```

### Testing the Analytical Model Directly

```bash
echo '{"posts":[{"likes":5000,"comments":150,"publishedAt":"2025-01-01T00:00:00Z"}],"follower_count":50000,"platform":"instagram","niche":"fashion"}' \
  | python3 analytical-models/pulse_analyzer.py
```

## ML Model Retraining

To retrain the XGBoost bot-detection classifier:

```bash
cd services/pulse-engine/ml-models
python3 generate_dataset.py   # Generate synthetic training data
python3 train_models.py       # Train and save xgboost_bot_model.pkl
```

## API Contract

**Endpoint (routed via backend-core):** `POST /api/ai/pulse`

**Request:**
```json
{ "url": "https://www.instagram.com/username" }
```

**Response:**
```json
{
  "success": true,
  "platform": "instagram",
  "handle": "username",
  "followers": 50000,
  "postCount": 12,
  "pulseMetrics": {
    "health_score": 78,
    "authenticity_score": 85,
    "authenticity_details": { ... },
    "sentiment": { "transactional": 30.0, "parasocial": 55.0, "critical": 8.0, "general": 7.0, "polarity": 0.32 },
    "decay_rate": { "half_life_hours": 22.5, "dvi_score": 4.2, ... },
    "cross_platform": { "overlap_ratio": 12.5, "migration_efficiency": "Moderate" }
  },
  "aiReport": "# Analysis Report...",
  "scrapedAt": "2025-01-01T10:00:00Z"
}
```

## Environment Variables

```
OPENAI_API_KEY=      # Required for Layer 3 GPT-4o reports
RAPIDAPI_KEY=        # Required for Layer 1 scraping
DATABASE_URL=        # Shared PostgreSQL instance (analytics_cache table)
```
