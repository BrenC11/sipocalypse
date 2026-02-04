import { requireAdminSession } from "../_lib/auth.js";
import {
  appendDailyScores,
  appendWinner,
  fetchGamesByDate,
  getDateStringInTimezone,
  getWinnerByDate,
  isGoogleSheetsConfigured,
} from "../_lib/googleSheets.js";
import { buildSocialCaption, buildWinnerImagePrompt, calculateDailyScore } from "../_lib/scoring.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isGoogleSheetsConfigured()) {
    return res.status(500).json({
      error: "Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY.",
    });
  }

  const session = requireAdminSession(req, res);
  if (!session) return;

  const date = typeof req.body?.date === "string" && req.body.date ? req.body.date : getDateStringInTimezone();
  const force = Boolean(req.body?.force);

  try {
    const existingWinner = await getWinnerByDate(date);
    if (existingWinner && !force) {
      return res.status(200).json({ ok: true, date, winner: existingWinner, skipped: true });
    }

    const games = await fetchGamesByDate(date);
    if (!games.length) {
      return res.status(404).json({ error: `No games found for ${date}.` });
    }

    const scored = games
      .map((game) => ({
        ...game,
        score: calculateDailyScore(game),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    await appendDailyScores(
      scored.map((entry) => ({
        date,
        gameId: entry.gameId,
        activity: entry.activity,
        score: entry.score,
        chaosLevel: entry.chaosLevel,
        ruleCount: entry.ruleCount,
        dareCount: entry.dareCount,
        createdAt: entry.createdAt,
      })),
    );

    const winner = scored[0];
    const imagePrompt = buildWinnerImagePrompt({ activity: winner.activity, score: winner.score, date });
    const socialCaption = buildSocialCaption({ activity: winner.activity, score: winner.score, date });

    await appendWinner({
      date,
      gameId: winner.gameId,
      activity: winner.activity,
      score: winner.score,
      status: "ready_for_card",
      imagePrompt,
      socialCaption,
    });

    return res.status(200).json({
      ok: true,
      date,
      winner: {
        gameId: winner.gameId,
        activity: winner.activity,
        score: winner.score,
        imagePrompt,
        socialCaption,
      },
      leaderboard: scored.slice(0, 5).map((entry) => ({
        gameId: entry.gameId,
        activity: entry.activity,
        score: entry.score,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Daily scoring job failed.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
