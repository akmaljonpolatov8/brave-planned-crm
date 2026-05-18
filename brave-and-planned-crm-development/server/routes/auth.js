const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { get } = require("../db/database");
const { auth, COOKIE_NAME } = require("../middleware/auth");

const router = express.Router();

function serializeCookie(name, value, maxAgeMs) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  if (typeof maxAgeMs === "number") {
    parts.push(`Max-Age=${Math.floor(maxAgeMs / 1000)}`);
  }
  return parts.join("; ");
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username va parol majburiy" });
  }

  const user = get(
    "SELECT id, username, full_name, password_hash, role, is_active FROM users WHERE username = ?",
    [username],
  );

  const teacher = user
    ? null
    : get(
        "SELECT id, username, full_name, password_hash, is_active FROM teachers WHERE username = ?",
        [username],
      );

  const account = user
    ? user
    : teacher
      ? { ...teacher, role: "teacher" }
      : null;

  if (!account || account.is_active !== 1 || !account.password_hash) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
  }

  const valid = bcrypt.compareSync(password, account.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
  }

  const token = signToken(account);
  res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, token, 7 * 24 * 60 * 60 * 1000));

  return res.json({
    user: {
      id: account.id,
      username: account.username,
      role: account.role,
      full_name: account.full_name,
    },
  });
});

router.post("/logout", (_req, res) => {
  res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, "", 0));
  return res.json({ ok: true });
});

router.get("/me", auth, (req, res) => {
  return res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    full_name: req.user.full_name,
  });
});

module.exports = router;
