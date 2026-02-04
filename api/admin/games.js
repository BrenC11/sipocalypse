import { requireAdminSession } from "../_lib/auth.js";
import {
  appendGameRecord,
  fetchGamesByDate,
  getDateStringInTimezone,
  isGoogleSheetsConfigured,
} from "../_lib/googleSheets.js";

const randomId = () => Math.random().toString(36).slice(2, 10);

export default async function handler(req, res) {
  if (!isGoogleSheetsConfigured()) {
    return res.status(500).json({
      error: "Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY.",
    });
  }

  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const date = typeof req.query?.date === "string" && req.query.date ? req.query.date : getDateStringInTimezone();

    try {
      const games = await fetchGamesByDate(date);
      return res.status(200).json({ date, games });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to load games from Google Sheets.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (req.method === "POST") {
    const activity = typeof req.body?.activity === "string" ? req.body.activity.trim() : "";
    const chaosLevel = Number(req.body?.chaosLevel) || 1;
    const rules = Array.isArray(req.body?.rules) ? req.body.rules.filter(Boolean) : [];
    const dares = Array.isArray(req.body?.dares) ? req.body.dares.filter(Boolean) : [];
    const date = typeof req.body?.date === "string" && req.body.date ? req.body.date : getDateStringInTimezone();

    if (!activity) {
      return res.status(400).json({ error: "Activity is required." });
    }

    try {
      const gameId = `game_${Date.now()}_${randomId()}`;
      const chaosScore = Math.max(0, Math.min(100, Math.round((Number(req.body?.chaosScore) || 0))));
      await appendGameRecord({
        gameId,
        date,
        activity,
        chaosLevel,
        rules,
        dares,
        chaosScore,
        status: "manual",
      });

      return res.status(201).json({ ok: true, gameId });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to save game to Google Sheets.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
