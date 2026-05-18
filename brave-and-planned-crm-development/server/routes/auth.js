const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db/database");

const router = express.Router();

const ACCESS_TOKEN_COOKIE = "bp_crm_token";

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  if (options.maxAge !== undefined)
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  return parts.join("; ");
}

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.cookie || "";
  for (const item of cookieHeader.split(";")) {
    const [key, ...rest] = item.split("=");
    if (key && key.trim() === ACCESS_TOKEN_COOKIE) {
      return decodeURIComponent(rest.join("=").trim());
    }
  }

  return null;
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
  }

  const token = signAccessToken(user);
  res.setHeader(
    "Set-Cookie",
    serializeCookie(ACCESS_TOKEN_COOKIE, encodeURIComponent(token), {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }),
  );

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
});

router.post("/refresh", (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: "Token topilmadi" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.id);
    if (!user) return res.status(401).json({ message: "Token yaroqsiz" });

    const nextToken = signAccessToken(user);
    res.setHeader(
      "Set-Cookie",
      serializeCookie(ACCESS_TOKEN_COOKIE, encodeURIComponent(nextToken), {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token xato" });
  }
});

router.post("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(ACCESS_TOKEN_COOKIE, "", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    }),
  );
  return res.json({ success: true });
});

router.get("/me", (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Token topilmadi" });
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = db
    .prepare("SELECT id, username, role FROM users WHERE id = ?")
    .get(payload.id);
  return res.json(user);
});

module.exports = router;
