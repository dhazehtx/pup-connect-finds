# AI Face Matching – How It Works & Integration Guide

## How it would work with an external API

1. **When a lost or found dog photo is uploaded**
   - Your app sends the image to a **vision/embedding API** (e.g. OpenAI Vision, Google Cloud Vision, or a pet-specific API).
   - The API returns a **vector embedding** (list of numbers describing the image).
   - Your backend stores that embedding in `dog_embeddings` (e.g. `POST /api/lost-dog/embedding` with `dog_id` and `embedding_vector`).

2. **When a new found dog is posted (or when you “Check for matches”)**
   - Generate an embedding for the found dog’s photo the same way.
   - **Compare** that vector to all stored lost-dog embeddings (e.g. cosine similarity or dot product).
   - Return alerts whose similarity is above a threshold (e.g. 0.85) as “Possible match.”

3. **Programming flow**
   - **Backend**: Call the external API (with your API key in env), get embedding, save to DB. On compare, load embeddings from DB, compute similarity in code or via a vector DB.
   - **Frontend**: “AI Match” or “Check for matches” triggers the backend; show possible matches with similarity score. No AI runs in the browser.

## Implemented in this app (Hugging Face CLIP)

- **Env**: `HF_TOKEN` or `HUGGINGFACE_API_KEY` — see `.env.example`.
- **Model**: defaults to `google/vit-base-patch16-224`; override with `HF_IMAGE_EMBEDDING_MODEL`.
- **Inference path**: `server/lib/imageEmbedding.ts` calls Hugging Face Inference Providers router (`https://router.huggingface.co/hf-inference`) instead of the retired legacy host.
- **AI Match** (`POST /api/lost-pet-alerts/ai-match`): user uploads a photo; server embeds it and compares to **active lost and found alerts** and **active Explore listings** (`dog_listings` with a primary image). Embeddings: `dog_embeddings` (alert id) and `listing_embeddings` (listing id). Listings get **lazy** embeds during AI Match (capped per request) and a **background** refresh when a listing is created/updated or listing media is committed (`HF_TOKEN` required for real vectors).
- **Listing noise control**: env **`AI_MATCH_MIN_LISTING_SCORE`** (range 0–1). If unset, the default is **`AI_MATCH_DEFAULT_MIN_LISTING_SCORE`** in `server/lib/aiMatchConfig.ts` (currently **0.68**). Marketplace rows below this CLIP score are dropped; lost/found alerts are not filtered by this threshold.
- **Tuning without labeled photos**: run **`npm run tune:ai-match`** with **`HF_TOKEN`** set and network access. The script embeds several fixed Wikimedia Commons images (dogs + cat), prints pairwise similarity stats, and suggests an env value from the high end of “unrelated” pairs plus a margin. That is a **guardrail**, not a substitute for measuring true same-dog vs different-dog accuracy on your own traffic.
- **Own content**: when the request is authenticated (`Authorization: Bearer` via global `/api` middleware), the viewer’s **user id** is excluded from both alert and listing candidate pools (no matching your own posts or listings).

## Automatic notifications (photo match)

- **File**: `server/lib/embeddingMatchNotify.ts`, called after each new alert is created (`POST /api/lost-pet-alerts`).
- When a **lost** or **found** alert is created with an `image_url` and `HF_TOKEN` is set, the server (async, non-blocking) compares the new photo to up to **25** recent opposite-type alerts (other users only).
- If **cosine similarity** is at least the configured minimum (default **0.78** via **`EMBEDDING_MATCH_NOTIFY_MIN_SCORE`** in `.env`, or **`EMBEDDING_MATCH_NOTIFY_DEFAULT_MIN_SCORE`** in `server/lib/aiMatchConfig.ts` when unset), the **other party** gets an in-app notification (`lost_found_photo_match`) with a link to the new listing.
- If `HF_TOKEN` is missing, this step does nothing (no crash).

## Fallback without HF

- AI Match falls back to location-ordered results with heuristic scores.
- Auto photo notifications do not run without `HF_TOKEN`.

## Long-term quality monitoring (automatic)

- **Telemetry table**: every `POST /api/lost-pet-alerts/ai-match` writes request-level quality signals to `ai_match_quality_events` (ranking mode, top score, result count, duration, model).
- **Nightly rollup job**: server startup enables an internal scheduler (`server/lib/aiMatchQualityMonitor.ts`) that computes prior-day metrics into `ai_match_quality_daily_metrics`.
- **Alert thresholds**: if request volume is high enough, threshold breaches are inserted into `ai_match_quality_alerts` and logged to server output.
- **Admin visibility**: use `GET /api/admin/ai-match-quality/daily`, `GET /api/admin/ai-match-quality/alerts`, and `GET /api/admin/ai-match-quality/events/recent`.
- **Manual run**: admins can trigger `POST /api/admin/ai-match-quality/run-nightly` for on-demand recalculation.
- **Config envs** (optional): `AI_MATCH_MONITOR_MIN_REQUESTS`, `AI_MATCH_MONITOR_MAX_FALLBACK_RATE`, `AI_MATCH_MONITOR_MAX_EMPTY_RATE`, `AI_MATCH_MONITOR_MIN_AVG_TOP_SCORE`.
