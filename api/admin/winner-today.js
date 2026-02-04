import { requireAdminSession } from "../_lib/auth.js";
import { getDateStringInTimezone, getWinnerByDate, isGoogleSheetsConfigured } from "../_lib/googleSheets.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isGoogleSheetsConfigured()) {
    return res.status(500).json({
      error: "Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY.",
    });
  }

  const session = requireAdminSession(req, res);
  if (!session) return;

  const date = typeof req.query?.date === "string" && req.query.date ? req.query.date : getDateStringInTimezone();

  try {
    const winner = await getWinnerByDate(date);
    return res.status(200).json({ date, winner });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load winner from Google Sheets.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
