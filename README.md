# Pup Connect Finds

## Quick start

```bash
cp .env.example .env
# Set DATABASE_URL (or NEON_DATABASE_URL) to your Postgres connection string.

npm install
npm run dev
```

The dev server runs the API and client (see `server/index.ts` / Vite config in-repo).

## Running without Hugging Face (`HF_TOKEN`)

The app **runs fully** without any Hugging Face token. Database, auth, Lost & Found listings, and most features work as long as `DATABASE_URL` is set.

**What needs `HF_TOKEN` (or `HUGGINGFACE_API_KEY`):**

- **AI Match** on Lost & Found — CLIP-style image embeddings and cosine similarity vs listings. Without a token, matching may fall back to non-embedding behavior (e.g. location ordering).
- **Automatic photo-match notifications** — Background embedding + notify logic in `server/lib/embeddingMatchNotify.ts` only activates when a token is present.

Add to `.env` when you have a token:

```env
HF_TOKEN=hf_xxxxxxxx
# or
# HUGGINGFACE_API_KEY=...
```

Create a read token at [Hugging Face settings](https://huggingface.co/settings/tokens).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production bundle    |
| `npm run check`| TypeScript check         |
| `npm run db:push` | Push schema (Drizzle) |

## Env

See `.env.example` for required and optional variables.
