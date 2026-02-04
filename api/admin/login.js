import { adminEmailAllowed, setSessionCookie, validateAdminPassword } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (!adminEmailAllowed(email) || !validateAdminPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  setSessionCookie(res, email);
  return res.status(200).json({ ok: true, email });
}
