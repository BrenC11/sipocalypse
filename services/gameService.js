
const GAME_GENERATOR_API_URL = '/api/generate-game';

// Cleans lines: removes leading numbering (e.g., "1. "), trims, and filters empty.
const cleanLines = (lines) => {
  if (!Array.isArray(lines)) return [];
  return lines
    .map(line => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean);
};

export const generateGameViaWebhook = async (params) => {
  if (!params.activity || params.activity.trim() === "") {
    throw new Error("Activity must be provided to generate a game.");
  }

  try {
    const response = await fetch(GAME_GENERATOR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const details = typeof errorPayload?.error === 'string' ? errorPayload.error : 'Unknown error';
      throw new Error(`Game generation request failed (${response.status}): ${details}`);
    }

    const payload = await response.json();
    if (!payload || typeof payload !== 'object') {
      throw new Error('Game generator returned an invalid response.');
    }

    const title = typeof payload.title === 'string'
      ? payload.title.trim()
      : `Sipocalypse Game for '${params.activity}'`;
    const rules = cleanLines(Array.isArray(payload.rules) ? payload.rules : []).slice(0, params.numberOfRules);
    const dares = params.includeDares
      ? cleanLines(Array.isArray(payload.dares) ? payload.dares : [])
      : [];

    if (rules.length === 0) {
      throw new Error('No rules were generated.');
    }

    return {
      title,
      rules,
      dares,
    };

  } catch (error) {
    console.error("SERVICE CRITICAL ERROR:", error);
    throw new Error(error.message || "An unknown error occurred in the game service.");
  }
};
