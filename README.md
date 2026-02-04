# Sipocalypse Website

## Run locally

Prerequisites: Node.js 18+

1. Install dependencies: `npm install`
2. Create `.env.local` with:
   - `OPENAI_API_KEY=...`
   - `OPENAI_MODEL=gpt-4.1-mini` (optional, defaults to this)
   - `RESEND_API_KEY=...` (or `resend_api_key=...`)
   - `RESEND_FROM_EMAIL="Sipocalypse <your-verified-from@yourdomain.com>"` (optional but recommended)
   - `SITE_URL=https://sipocalypse.fun` (optional, used for absolute email asset URLs)
   - `GSHEET_WEBHOOK_URL=...` (optional, posts email/activity to your Google Sheet webhook)
   - `GSHEET_WEBHOOK_SECRET=...` (optional/recommended, shared secret for Google Sheet webhook auth)
3. Start dev server: `npm run dev`

## API integration

- Frontend calls `POST /api/generate-game`
- `api/generate-game.js` calls OpenAI Chat Completions using your server-side secret
- Main game generation no longer uses Make.com webhook
- Frontend cocktail form calls `POST /api/send-cocktail`
- `api/send-cocktail.js` generates a recipe with OpenAI and sends the email with Resend
- If `GSHEET_WEBHOOK_URL` is set, the backend also posts lead data to your Google Sheet endpoint

Note: in production on Vercel, configure your env vars in Project Settings -> Environment Variables.
