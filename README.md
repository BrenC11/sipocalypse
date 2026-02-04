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
   - `GSHEET_STRICT=true` (optional, fail API request when Sheet logging fails)
   - `GOOGLE_SHEETS_SPREADSHEET_ID=...` (for native admin backend + game logging)
   - `GOOGLE_SHEETS_CLIENT_EMAIL=...` (Google service account email)
   - `GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - `SIPOCALYPSE_TIMEZONE=America/Los_Angeles` (optional, used for daily date bucketing)
   - `ADMIN_EMAILS=you@example.com,other-admin@example.com`
   - `ADMIN_PASSWORD=...` (single shared admin password)
   - `ADMIN_SESSION_SECRET=...` (random long string for signed admin session cookies)
3. Start dev server: `npm run dev`

## API integration

- Frontend calls `POST /api/generate-game`
- `api/generate-game.js` calls OpenAI Chat Completions using your server-side secret
- Main game generation no longer uses Make.com webhook
- If Google Sheets env vars are present, generated games are also appended to the `games` sheet
- Frontend cocktail form calls `POST /api/send-cocktail`
- `api/send-cocktail.js` generates a recipe with OpenAI and sends the email with Resend
- If `GSHEET_WEBHOOK_URL` is set, the backend also posts lead data to your Google Sheet endpoint
- API response includes `sheet.attempted`, `sheet.success`, and `sheet.error` for diagnostics
- Admin backend routes:
  - `POST /api/admin/login`
  - `GET /api/admin/session`
  - `POST /api/admin/logout`
  - `GET /api/admin/setup-check` (debug endpoint for missing env vars + Sheet access)
  - `GET /api/admin/games?date=YYYY-MM-DD`
  - `GET /api/admin/winner-today?date=YYYY-MM-DD`
  - `POST /api/admin/daily-run` (computes scores out of 100, writes winner)

## Google Sheet structure

Create a spreadsheet and tabs named exactly:
- `games`
- `daily_scores`
- `winners`

Headers are auto-created on first write if the tab exists.
The backend also accepts spaced/cased headers such as `Game ID`, `Created at`, `Game Name`, `Rules`, `Dares`, and `Score`.

Important: Share the spreadsheet with your service account email as Editor.

Note: in production on Vercel, configure your env vars in Project Settings -> Environment Variables.
