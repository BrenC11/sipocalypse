import crypto from "node:crypto";

const COOKIE_NAME = "sipocalypse_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const base64UrlEncode = (value) =>
  Buffer.from(typeof value === "string" ? value : JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value) =>
  Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

const getSessionSecret = () => process.env.ADMIN_SESSION_SECRET || "dev-only-change-me";
const isProduction = process.env.NODE_ENV === "production";

const sign = (data) =>
  crypto.createHmac("sha256", getSessionSecret()).update(data).digest("base64url");

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const idx = part.indexOf("=");
      if (idx <= 0) return acc;
      const key = part.slice(0, idx);
      const value = part.slice(idx + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

const createToken = ({ email }) => {
  const payload = {
    email,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const readToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;
  const expected = sign(payloadEncoded);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded));
    if (!payload?.email || !payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

const createCookie = (token) =>
  `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
    SESSION_TTL_MS / 1000,
  )}${isProduction ? "; Secure" : ""}`;

export const clearSessionCookie = () =>
  `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;

export const getSessionFromReq = (req) => {
  const cookies = parseCookies(req.headers?.cookie || "");
  return readToken(cookies[COOKIE_NAME]);
};

export const requireAdminSession = (req, res) => {
  const session = getSessionFromReq(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session;
};

export const setSessionCookie = (res, email) => {
  const token = createToken({ email });
  res.setHeader("Set-Cookie", createCookie(token));
};

export const adminEmailAllowed = (email) => {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) return false;
  return allowed.includes(String(email || "").trim().toLowerCase());
};

export const validateAdminPassword = (password) => {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return String(password || "") === expected;
};
