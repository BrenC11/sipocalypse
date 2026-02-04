import crypto from "node:crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

const DEFAULT_GAMES_HEADERS = [
  "game_id",
  "date",
  "created_at",
  "activity",
  "game_name",
  "rule_count",
  "chaos_level",
  "rules_json",
  "dares_json",
  "chaos_score",
  "status",
];

const DEFAULT_DAILY_SCORES_HEADERS = [
  "date",
  "game_id",
  "activity",
  "score",
  "chaos_level",
  "rule_count",
  "dare_count",
  "created_at",
];

const DEFAULT_WINNERS_HEADERS = [
  "date",
  "game_id",
  "activity",
  "score",
  "status",
  "image_prompt",
  "image_url",
  "social_caption",
  "posted_at",
  "created_at",
];

const GAMES_FIELDS = [
  { key: "gameId", aliases: ["game_id", "game id", "id"] },
  { key: "date", aliases: ["date"] },
  { key: "createdAt", aliases: ["created_at", "created at", "timestamp"] },
  { key: "activity", aliases: ["activity"] },
  { key: "gameName", aliases: ["game_name", "game name", "name", "title"] },
  { key: "ruleCount", aliases: ["rule_count", "rule count", "number of rules"] },
  { key: "chaosLevel", aliases: ["chaos_level", "chaos level"] },
  { key: "rulesJson", aliases: ["rules_json", "rules"] },
  { key: "daresJson", aliases: ["dares_json", "dares"] },
  { key: "chaosScore", aliases: ["chaos_score", "score"] },
  { key: "status", aliases: ["status"] },
];

const DAILY_SCORES_FIELDS = [
  { key: "date", aliases: ["date"] },
  { key: "gameId", aliases: ["game_id", "game id"] },
  { key: "activity", aliases: ["activity"] },
  { key: "score", aliases: ["score"] },
  { key: "chaosLevel", aliases: ["chaos_level", "chaos level"] },
  { key: "ruleCount", aliases: ["rule_count", "rule count", "number of rules"] },
  { key: "dareCount", aliases: ["dare_count", "dare count", "number of dares"] },
  { key: "createdAt", aliases: ["created_at", "created at"] },
];

const WINNERS_FIELDS = [
  { key: "date", aliases: ["date"] },
  { key: "gameId", aliases: ["game_id", "game id"] },
  { key: "activity", aliases: ["activity"] },
  { key: "score", aliases: ["score"] },
  { key: "status", aliases: ["status"] },
  { key: "imagePrompt", aliases: ["image_prompt", "image prompt"] },
  { key: "imageUrl", aliases: ["image_url", "image url"] },
  { key: "socialCaption", aliases: ["social_caption", "social caption"] },
  { key: "postedAt", aliases: ["posted_at", "posted at"] },
  { key: "createdAt", aliases: ["created_at", "created at"] },
];

let tokenCache = {
  accessToken: null,
  expiresAtEpochMs: 0,
};

const base64UrlEncode = (value) =>
  Buffer.from(typeof value === "string" ? value : JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const normalizePrivateKey = (key) => (typeof key === "string" ? key.replace(/\\n/g, "\n") : "");

const getConfig = () => ({
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  privateKey: normalizePrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY),
});

export const isGoogleSheetsConfigured = () => {
  const cfg = getConfig();
  return Boolean(cfg.spreadsheetId && cfg.clientEmail && cfg.privateKey);
};

const getTimezone = () => process.env.SIPOCALYPSE_TIMEZONE || "America/Los_Angeles";

export const getDateStringInTimezone = (date = new Date(), timeZone = getTimezone()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const createGoogleJwt = ({ clientEmail, privateKey }) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: GOOGLE_TOKEN_URL,
    exp: nowSec + 3500,
    iat: nowSec,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const unsignedJwt = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer
    .sign(privateKey)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedJwt}.${signature}`;
};

const getGoogleAccessToken = async () => {
  if (tokenCache.accessToken && tokenCache.expiresAtEpochMs - 60_000 > Date.now()) {
    return tokenCache.accessToken;
  }

  const cfg = getConfig();
  if (!cfg.clientEmail || !cfg.privateKey) {
    throw new Error("Google Sheets auth is not configured.");
  }

  const assertion = createGoogleJwt({ clientEmail: cfg.clientEmail, privateKey: cfg.privateKey });
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const tokenResp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResp.ok) {
    const details = await tokenResp.text().catch(() => "");
    throw new Error(`Google OAuth token request failed (${tokenResp.status}) ${details}`.trim());
  }

  const payload = await tokenResp.json();
  tokenCache = {
    accessToken: payload.access_token,
    expiresAtEpochMs: Date.now() + Number(payload.expires_in || 3600) * 1000,
  };

  return tokenCache.accessToken;
};

const callSheetsApi = async (path, init = {}) => {
  const { spreadsheetId } = getConfig();
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID.");
  }

  const accessToken = await getGoogleAccessToken();
  const resp = await fetch(`${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!resp.ok) {
    const details = await resp.text().catch(() => "");
    throw new Error(`Google Sheets API failed (${resp.status}) ${details}`.trim());
  }

  return resp.json();
};

const getValues = async (range) => {
  const encodedRange = encodeURIComponent(range);
  const payload = await callSheetsApi(`/values/${encodedRange}`);
  return payload.values || [];
};

const updateValues = async (range, values) => {
  const encodedRange = encodeURIComponent(range);
  return callSheetsApi(`/values/${encodedRange}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: JSON.stringify({ values }),
  });
};

const appendValues = async (range, values) => {
  const encodedRange = encodeURIComponent(range);
  return callSheetsApi(`/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values }),
  });
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const getHeaderRow = async (sheetName, defaults) => {
  const current = await getValues(`${sheetName}!1:1`);
  if (current.length > 0 && current[0]?.length > 0) return current[0];
  await updateValues(`${sheetName}!A1`, [defaults]);
  return defaults;
};

const buildAliasIndex = (fields) => {
  const aliasToKey = {};
  fields.forEach((field) => {
    field.aliases.forEach((alias) => {
      aliasToKey[normalizeHeader(alias)] = field.key;
    });
  });
  return aliasToKey;
};

const getFieldMapFromHeaders = (headers, fields) => {
  const aliasToKey = buildAliasIndex(fields);
  const keyToHeader = {};
  headers.forEach((header) => {
    const key = aliasToKey[normalizeHeader(header)];
    if (key && !keyToHeader[key]) {
      keyToHeader[key] = header;
    }
  });
  return keyToHeader;
};

const getSheetRows = async (sheetName) => {
  const values = await getValues(`${sheetName}!A:Z`);
  if (!values.length) return { headers: [], rows: [] };
  const headers = values[0];
  const rows = values.slice(1).map((row) => {
    const mapped = {};
    headers.forEach((header, idx) => {
      mapped[header] = row[idx] ?? "";
    });
    return mapped;
  });
  return { headers, rows };
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(/\r?\n|\s*\|\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const toNumberOr = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toRecordByFields = (row, headers, fields) => {
  const keyToHeader = getFieldMapFromHeaders(headers, fields);
  const record = {};
  fields.forEach((field) => {
    const header = keyToHeader[field.key];
    record[field.key] = header ? row[header] : "";
  });
  return record;
};

const appendRecord = async (sheetName, defaults, fields, dataByKey) => {
  const headers = await getHeaderRow(sheetName, defaults);
  const keyToHeader = getFieldMapFromHeaders(headers, fields);
  const row = headers.map((header) => {
    const field = fields.find((item) => keyToHeader[item.key] === header);
    if (!field) return "";
    return dataByKey[field.key] ?? "";
  });
  await appendValues(`${sheetName}!A:Z`, [row]);
};

export const appendGameRecord = async ({
  gameId,
  date,
  activity,
  gameName,
  chaosLevel,
  rules,
  dares,
  chaosScore,
  status = "generated",
  createdAt = new Date().toISOString(),
}) => {
  await appendRecord("games", DEFAULT_GAMES_HEADERS, GAMES_FIELDS, {
    gameId,
    date,
    createdAt,
    activity,
    gameName: gameName || activity,
    chaosLevel,
    ruleCount: rules.length,
    rulesJson: JSON.stringify(rules),
    daresJson: JSON.stringify(dares),
    chaosScore,
    status,
  });
};

export const fetchGamesByDate = async (date) => {
  const { headers, rows } = await getSheetRows("games");

  return rows
    .map((row) => toRecordByFields(row, headers, GAMES_FIELDS))
    .filter((row) => String(row.date || "").trim() === String(date).trim())
    .map((row) => {
      const rules = parseJsonArray(row.rulesJson);
      const dares = parseJsonArray(row.daresJson);
      return {
        gameId: row.gameId || `game_${Math.random().toString(36).slice(2, 10)}`,
        date: row.date,
        createdAt: row.createdAt || new Date().toISOString(),
        activity: row.activity || "",
        gameName: row.gameName || row.activity || "",
        chaosLevel: toNumberOr(row.chaosLevel, 1),
        ruleCount: toNumberOr(row.ruleCount, Array.isArray(rules) ? rules.length : 0),
        dareCount: toNumberOr(row.dareCount, Array.isArray(dares) ? dares.length : 0),
        rules: Array.isArray(rules) ? rules : [],
        dares: Array.isArray(dares) ? dares : [],
        chaosScore: toNumberOr(row.chaosScore, 0),
        status: row.status || "generated",
      };
    });
};

export const appendDailyScores = async (scores) => {
  if (!scores.length) return;

  const rows = scores.map((item) => ({
    date: item.date,
    gameId: item.gameId,
    activity: item.activity,
    score: item.score,
    chaosLevel: item.chaosLevel,
    ruleCount: item.ruleCount,
    dareCount: item.dareCount,
    createdAt: item.createdAt,
  }));

  for (const row of rows) {
    await appendRecord("daily_scores", DEFAULT_DAILY_SCORES_HEADERS, DAILY_SCORES_FIELDS, row);
  }
};

export const getWinnerByDate = async (date) => {
  const { headers, rows } = await getSheetRows("winners");
  const mapped = rows.map((row) => toRecordByFields(row, headers, WINNERS_FIELDS));
  const match = mapped.find((row) => String(row.date || "").trim() === String(date).trim());
  if (!match) return null;
  return {
    date: match.date,
    gameId: match.gameId,
    activity: match.activity,
    score: toNumberOr(match.score, 0),
    status: match.status || "ready_for_card",
    imagePrompt: match.imagePrompt || "",
    imageUrl: match.imageUrl || "",
    socialCaption: match.socialCaption || "",
    postedAt: match.postedAt || "",
    createdAt: match.createdAt || "",
  };
};

export const appendWinner = async ({
  date,
  gameId,
  activity,
  score,
  status = "ready_for_card",
  imagePrompt = "",
  imageUrl = "",
  socialCaption = "",
  postedAt = "",
  createdAt = new Date().toISOString(),
}) => {
  await appendRecord("winners", DEFAULT_WINNERS_HEADERS, WINNERS_FIELDS, {
    date,
    gameId,
    activity,
    score,
    status,
    imagePrompt,
    imageUrl,
    socialCaption,
    postedAt,
    createdAt,
  });
};

export const verifyGoogleSheetsAccess = async () => {
  if (!isGoogleSheetsConfigured()) {
    return { ok: false, error: "Missing Google Sheets env vars." };
  }

  try {
    await getValues("games!1:1");
    await getValues("daily_scores!1:1");
    await getValues("winners!1:1");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Google Sheets error",
    };
  }
};
