# Sipocalypse Website

## Run locally

Prerequisites: Node.js 18+

1. Install dependencies: `npm install`
2. Create `.env.local` with:
   - `OPENAI_API_KEY=...`
   - `OPENAI_MODEL=gpt-4.1-mini` (optional, defaults to this)
3. Start dev server: `npm run dev`

## API integration

- Frontend calls `POST /api/generate-game`
- `api/generate-game.js` calls OpenAI Chat Completions using your server-side secret
- Main game generation no longer uses Make.com webhook

Note: the cocktail email capture flow in `components/GameGenerator.tsx` still posts to a Make.com webhook.
