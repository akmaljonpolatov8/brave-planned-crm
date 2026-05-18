const express = require("express");
const bcrypt = require("bcryptjs");
const roleCheck = require("../middleware/roleCheck");
const { all, get, run } = require("../db/database");

const router = express.Router();

router.get("/", (_req, res) => {
  const rows = all(
    `
      SELECT
        t.id,
        t.full_name,
        t.phone,
        t.username,
        t.is_active,
        COUNT(g.id) AS group_count
      FROM teachers t
      LEFT JOIN groups g ON g.teacher_id = t.id AND g.is_active = 1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `,
  );
  return res.json(rows);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, phone, username, password } = req.body || {};
  if (!full_name) {
    return res.status(400).json({ message: "O'qituvchi ismi majburiy" });
  }
  const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
  const result = run(
    "INSERT INTO teachers (full_name, phone, username, password_hash) VALUES (?, ?, ?, ?)",
    [full_name, phone || "", username || null, passwordHash],
  );
  return res.status(201).json(get("SELECT * FROM teachers WHERE id = ?", [result.lastInsertRowid]));
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, phone, username, password, is_active = 1 } = req.body || {};
  const current = get("SELECT * FROM teachers WHERE id = ?", [req.params.id]);
  const passwordHash = password ? bcrypt.hashSync(password, 10) : current.password_hash;
  run(
    `
      UPDATE teachers
      SET full_name = ?, phone = ?, username = ?, password_hash = ?, is_active = ?
      WHERE id = ?
    `,
    [full_name, phone || "", username || null, passwordHash, is_active ? 1 : 0, req.params.id],
  );
  return res.json(get("SELECT * FROM teachers WHERE id = ?", [req.params.id]));
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  run("DELETE FROM teachers WHERE id = ?", [req.params.id]);
  return res.json({ ok: true });
});

module.exports = router;
