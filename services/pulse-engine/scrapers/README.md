# Scrapers — Data Ingestion Layer

This directory contains the data-fetching and caching layer for the Pulse Engine.

## Files

| File | Purpose |
|---|---|
| `creatorDataService.js` | Scrapes Instagram & YouTube profiles via RapidAPI. Caches results in PostgreSQL (`analytics_cache` table) with a 6-hour TTL. Falls back to mock data if the API is unavailable. |

## Environment Variables Required

```
RAPIDAPI_KEY=         # RapidAPI key for Instagram/YouTube scraping
DATABASE_URL=         # PostgreSQL connection string (shared with backend-core)
```

## Apify Integration (Future)

Apify actors for high-volume scraping can be connected here. Recommended actors:
- `apify/instagram-scraper` — Full profile + post history
- `bernardo_veloso/youtube-scraper` — Channel metadata + video list

Configure via `APIFY_TOKEN` and call the Apify REST API from this service.

## Cache Table Schema

```sql
CREATE TABLE IF NOT EXISTS analytics_cache (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER,
  platform     VARCHAR(20),
  handle       VARCHAR(255),
  data         JSONB,
  scraped_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, handle)
);
```
