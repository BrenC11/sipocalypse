const CHAOS_LABELS = {
  1: "Initial Sips",
  2: "Rising Revelry",
  3: "Pre-Apocalyptic Party",
  4: "Sipocalypse Level Event",
};

const clampChaosLevel = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 1;
  return Math.min(4, Math.max(1, Math.round(num)));
};

const clampRuleCount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.min(11, Math.max(1, Math.round(num)));
};

const systemPrompt = `
You are Rulelord 5000 and Darebrain 9000 for the party game Sipocalypse.
Generate drinking-game rules and optional dares based on user input.

Return ONLY valid JSON with this exact shape:
{
  "title": "string",
  "rules": ["string"],
  "dares": ["string"]
}

Requirements:
- Rules and dares must be directly related to the provided activity.
- Keep rules/dares short, punchy, funny, and easy to follow.
- Keep all content party-safe and non-harmful.
- Match drinking frequency and intensity to chaos level:
  1 = rare triggers,
  2 = moderate,
  3 = frequent,
  4 = mayhem.
- "rules" must contain exactly the requested number of items.
- If includeDares is false, return an empty "dares" array.
- If includeDares is true, return 3 to 5 dares.
- No markdown, no code fences, no extra keys.
`.trim();

const createUserPrompt = ({ activity, chaosLevel, numberOfRules, includeDares }) => `
Activity: ${activity}
Chaos Level: ${chaosLevel} (${CHAOS_LABELS[chaosLevel]})
Number of Rules: ${numberOfRules}
Include Dares: ${includeDares ? "yes" : "no"}
`.trim();

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
  }

  const activity = typeof req.body?.activity === "string" ? req.body.activity.trim() : "";
  const chaosLevel = clampChaosLevel(req.body?.chaosLevel);
  const numberOfRules = clampRuleCount(req.body?.numberOfRules);
  const includeDares = Boolean(req.body?.includeDares);

  if (!activity) {
    return res.status(400).json({ error: "Activity is required." });
  }

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: createUserPrompt({ activity, chaosLevel, numberOfRules, includeDares }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sipocalypse_game",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                rules: {
                  type: "array",
                  items: { type: "string" },
                },
                dares: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["title", "rules", "dares"],
            },
          },
        },
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return res.status(502).json({
        error: `OpenAI request failed (${openAiResponse.status}).`,
        details: errorText,
      });
    }

    const payload = await openAiResponse.json();
    const rawContent = payload?.choices?.[0]?.message?.content;

    if (typeof rawContent !== "string" || !rawContent.trim()) {
      return res.status(502).json({ error: "OpenAI returned no content." });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return res.status(502).json({ error: "OpenAI returned invalid JSON." });
    }

    const rules = normalizeStringArray(parsed.rules).slice(0, numberOfRules);
    const dares = includeDares ? normalizeStringArray(parsed.dares).slice(0, 5) : [];
    const title =
      typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title.trim()
        : `Sipocalypse Game for "${activity}"`;

    if (rules.length === 0) {
      return res.status(502).json({ error: "No rules were generated." });
    }

    return res.status(200).json({
      title,
      rules,
      dares,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error while generating game.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
