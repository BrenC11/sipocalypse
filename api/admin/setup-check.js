import { isGoogleSheetsConfigured, verifyGoogleSheetsAccess } from "../_lib/googleSheets.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const missingEnvVars = [
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SHEETS_CLIENT_EMAIL",
    "GOOGLE_SHEETS_PRIVATE_KEY",
    "ADMIN_EMAILS",
    "ADMIN_PASSWORD",
    "ADMIN_SESSION_SECRET",
  ].filter((key) => !process.env[key]);

  const sheetsConfigured = isGoogleSheetsConfigured();
  const sheetsAccess = sheetsConfigured ? await verifyGoogleSheetsAccess() : { ok: false, error: "Not configured" };

  return res.status(200).json({
    ok: missingEnvVars.length === 0 && sheetsAccess.ok,
    missingEnvVars,
    sheetsConfigured,
    sheetsAccess,
  });
}
