import { requireAdminSession } from "../_lib/auth.js";
import {
  fetchGameById,
  getDateStringInTimezone,
  getWinnerByDate,
  isGoogleSheetsConfigured,
  updateWinnerByDate,
} from "../_lib/googleSheets.js";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

const buildTarotPrompt = ({ gameName, activity, rulesText }) => {
  const nameLine = gameName ? `Game Name: ${gameName}` : "";
  const activityLine = activity ? `Activity: ${activity}` : "";

  return `Create a square (1:1) custom tarot card with a bold, bright post-apocalyptic aesthetic using the following colour palette:
- Dark Moss Green: #325B23
- Rich Black: #030615
- Eminence Purple: #532368
- Yellow Green: #87DF16
- Lime: #BEFD0F
- Steel Pink: #D302AE

The design should feature a thin, detailed border inspired by apocalyptic themes — including elements like radioactive symbols, mushroom clouds, cracked warning signs, or chaotic iconography.

Inside the card:
- Leave a wide blank title space at the top of the card.
- If the Game Name is empty or missing, invent a fun, post-apocalyptic drinking game name.
- Otherwise, use the Game Name.
- Below the title space, include a large content area taking up at least 99% of the card’s height (excluding the title space), framed within the border.
- This central area should be mostly blank, dark or lightly textured, allowing legible rule text to be overlaid.
- If the Rules section is empty or missing, invent 3–5 fun, dumb, chaos-themed drinking rules to go with the game name.
- Otherwise, use the Rules provided.

Text formatting:
- Format the rules clearly, neatly, and with perfect spelling.
- Display them as a numbered list, but do not label the section “Rules.”
- Prioritise clear, legible typography that fits the aesthetic without sacrificing readability.

The border artwork must never encroach on the main content area.

${nameLine}
${activityLine}
Rules:
${rulesText}`.trim();
};

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

  const openAiKey = process.env.OPENAI_API_KEY;
  const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";
  if (!openAiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
  }

  const date = typeof req.body?.date === "string" && req.body.date ? req.body.date : getDateStringInTimezone();

  try {
    const winner = await getWinnerByDate(date);
    if (!winner) {
      return res.status(404).json({ error: `No winner found for ${date}.` });
    }

    const game = await fetchGameById(winner.gameId);
    const rulesText = game?.rules?.length ? game.rules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n") : "";
    const prompt = buildTarotPrompt({
      gameName: game?.gameName || winner.activity || "",
      activity: winner.activity,
      rulesText,
    });

    const imageResp = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: imageModel,
        prompt,
        size: "1024x1024",
      }),
    });

    if (!imageResp.ok) {
      const raw = await imageResp.text().catch(() => "");
      let details = raw;
      try {
        const parsed = JSON.parse(raw);
        details = parsed?.error?.message || raw;
      } catch {
        details = raw;
      }
      return res.status(502).json({
        error: `OpenAI image request failed (${imageResp.status}).`,
        details,
        model: imageModel,
      });
    }

    const payload = await imageResp.json();
    const imageUrl = payload?.data?.[0]?.url || "";
    const imageBase64 = payload?.data?.[0]?.b64_json || "";
    const resolvedImageUrl = imageUrl || (imageBase64 ? `data:image/png;base64,${imageBase64}` : "");
    if (!resolvedImageUrl) {
      return res.status(502).json({ error: "OpenAI returned no image data." });
    }

    const update = await updateWinnerByDate({
      date,
      updates: {
        imagePrompt: prompt,
        imageUrl,
        status: "image_generated",
      },
    });

    if (!update.ok) {
      return res.status(500).json({ error: update.error || "Failed to update winner." });
    }

    return res.status(200).json({
      ok: true,
      date,
      winner: {
        ...winner,
        imagePrompt: prompt,
        imageUrl: resolvedImageUrl,
        status: "image_generated",
      },
      imageUrl: resolvedImageUrl,
      model: imageModel,
      note: imageUrl
        ? "Image URL expires after ~60 minutes unless you store it elsewhere."
        : "Image returned as base64 data URL; store it for long-term use.",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to generate winner image.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
