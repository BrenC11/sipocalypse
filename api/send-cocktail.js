const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const RESEND_API_URL = "https://api.resend.com/emails";

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const cocktailSystemPrompt = `
You are the unhinged but loveable head bartender at Sipocalypse.
Create a bizarrely brilliant cocktail based on an activity.

You MUST strictly follow this exact output format and line breaks:

Drink Name: [The name of the cocktail]

Ingredients:
[Each ingredient on its own line]

Instructions:
[Each instruction step on its own line]

Description: [One short, punchy one-liner]

Rules:
- No intro text
- No outro text
- No markdown
- No code fences
- Keep ingredients realistic and drinkable
`.trim();

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const toListItems = (items) =>
  items
    .map((item) => `<li style="margin: 0 0 8px 0;">${escapeHtml(item)}</li>`)
    .join("");

const parseRecipeText = (recipeText) => {
  const normalized = recipeText.replace(/\r\n/g, "\n").trim();

  const nameMatch = normalized.match(/Drink Name:\s*(.+)/i);
  const ingredientsMatch = normalized.match(/Ingredients:\s*\n([\s\S]*?)\n\s*Instructions:/i);
  const instructionsMatch = normalized.match(/Instructions:\s*\n([\s\S]*?)\n\s*Description:/i);
  const descriptionMatch = normalized.match(/Description:\s*([\s\S]*)$/i);

  const drinkName = (nameMatch?.[1] || "Custom Chaos Cocktail").trim();
  const ingredients = (ingredientsMatch?.[1] || "")
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
  const instructions = (instructionsMatch?.[1] || "")
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[\).\s-]*/, "").trim())
    .filter(Boolean);
  const description = (descriptionMatch?.[1] || "A bunker-approved sip for maximum chaos.").trim();

  return { drinkName, ingredients, instructions, description };
};

const appendLeadToGoogleSheet = async ({ webhookUrl, secret, email, activity }) => {
  if (!webhookUrl) return;

  const resp = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      timestamp: new Date().toISOString(),
      email,
      activity,
      source: "sipocalypse-cocktail-form",
    }),
  });

  if (!resp.ok) {
    const details = await resp.text().catch(() => "");
    throw new Error(`Google Sheet webhook failed (${resp.status}) ${details}`.trim());
  }
};

const toHtml = ({ activity, drinkName, ingredients, instructions, description, logoUrl }) => {
  const ingredientsHtml = toListItems(ingredients);
  const instructionsHtml = toListItems(instructions);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Custom Chaos Cocktail!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f0f0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="table-layout: fixed; background-color: #f0f0f0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 20px; background-color: #5a005a; color: #bbff11; font-size: 24px; font-weight: 700; border-radius: 10px 10px 0 0; text-align: center;">
              YOUR CUSTOM CHAOS COCKTAIL!
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 30px;">
              <img src="${escapeHtml(logoUrl)}" alt="Sipocalypse Logo" style="display: block; width: 250px; height: auto; margin: 0 auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0 0 15px 0;">
                Hey there, fellow Sipocalyptic adventurer!
              </p>
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0;">
                Here's the custom chaos cocktail recipe we whipped up just for your activity: <strong>${escapeHtml(activity)}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px 10px 30px;">
              <h3 style="color: #a62e92; font-size: 20px; margin: 0;">${escapeHtml(drinkName)}</h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0 0 5px 0;">
                <strong style="color: #a62e92;">Ingredients:</strong>
              </p>
              <ul style="list-style-type: disc; padding: 0; margin: 0 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                ${ingredientsHtml}
              </ul>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0 0 5px 0;">
                <strong style="color: #a62e92;">Instructions:</strong>
              </p>
              <ol style="list-style-type: decimal; padding: 0; margin: 0 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                ${instructionsHtml}
              </ol>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #333333; margin: 0;">
                <em style="color: #5a005a;">"${escapeHtml(description)}"</em>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px; font-size: 14px; color: #777777; background-color: #eeeeee; border-radius: 0 0 10px 10px; text-align: center;">
              Enjoy the Sipocalypse!
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY || process.env.resend_api_key;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const from = process.env.RESEND_FROM_EMAIL || "Sipocalypse <onboarding@resend.dev>";
  const siteUrl = process.env.SITE_URL || "https://sipocalypse.fun";
  const googleSheetWebhookUrl = process.env.GSHEET_WEBHOOK_URL;
  const googleSheetWebhookSecret = process.env.GSHEET_WEBHOOK_SECRET;
  const strictSheetLogging = process.env.GSHEET_STRICT === "true";
  const logoUrl = `${siteUrl.replace(/\/$/, "")}/sipocalypse-logo.png`;

  if (!openAiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
  }
  if (!resendKey) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY (or resend_api_key) on server." });
  }

  const activity = typeof req.body?.activity === "string" ? req.body.activity.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";

  if (!activity) {
    return res.status(400).json({ error: "Activity is required." });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Valid email is required." });
  }

  try {
    const aiResp = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        messages: [
          { role: "system", content: cocktailSystemPrompt },
          { role: "user", content: `The activity is: ${activity}` },
        ],
      }),
    });

    if (!aiResp.ok) {
      const details = await aiResp.text();
      return res.status(502).json({
        error: `OpenAI request failed (${aiResp.status}).`,
        details,
      });
    }

    const aiPayload = await aiResp.json();
    const recipeText = aiPayload?.choices?.[0]?.message?.content?.trim();

    if (!recipeText || typeof recipeText !== "string") {
      return res.status(502).json({ error: "Failed to generate cocktail recipe." });
    }
    const parsedRecipe = parseRecipeText(recipeText);

    const resendResp = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Your Sipocalypse Cocktail for "${activity}"`,
        text: recipeText,
        html: toHtml({
          activity,
          drinkName: parsedRecipe.drinkName,
          ingredients: parsedRecipe.ingredients,
          instructions: parsedRecipe.instructions,
          description: parsedRecipe.description,
          logoUrl,
        }),
      }),
    });

    if (!resendResp.ok) {
      const details = await resendResp.text();
      return res.status(502).json({
        error: `Resend request failed (${resendResp.status}).`,
        details,
      });
    }

    const sheetResult = {
      attempted: Boolean(googleSheetWebhookUrl),
      success: false,
      error: null,
    };

    // Optional lead capture.
    if (googleSheetWebhookUrl) {
      try {
        await appendLeadToGoogleSheet({
          webhookUrl: googleSheetWebhookUrl,
          secret: googleSheetWebhookSecret,
          email,
          activity,
        });
        sheetResult.success = true;
      } catch (sheetError) {
        sheetResult.error = sheetError instanceof Error ? sheetError.message : "Unknown sheet error";
        console.error("Lead capture failed:", sheetResult.error);
        if (strictSheetLogging) {
          return res.status(502).json({
            success: false,
            error: "Email sent, but Google Sheet logging failed.",
            sheet: sheetResult,
          });
        }
      }
    }

    return res.status(200).json({ success: true, sheet: sheetResult });
  } catch (error) {
    return res.status(500).json({
      error: "Server error while sending cocktail email.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
