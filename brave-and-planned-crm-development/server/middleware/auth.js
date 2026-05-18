const jwt = require("jsonwebtoken");

function getToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  const cookieHeader = req.headers.cookie || "";
  for (const item of cookieHeader.split(";")) {
    const [key, ...rest] = item.split("=");
    if (key && key.trim() === "bp_crm_token") {
      return decodeURIComponent(rest.join("=").trim());
    }
  }

  return null;
}

function auth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: "Avtorizatsiya talab qilinadi" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token yaroqsiz" });
  }
}

module.exports = auth;
