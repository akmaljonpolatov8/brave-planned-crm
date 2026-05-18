const express = require("express");
const roleCheck = require("../middleware/roleCheck");
const { all, get, run, transaction } = require("../db/database");

const router = express.Router();

router.get("/", (req, res) => {
  const groupId = req.query.group_id;
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  if (!groupId) {
    return res.json([]);
  }
  const rows = all(
    `
      SELECT
        s.id AS student_id,
        s.full_name,
        COALESCE(a.status, '') AS status,
        COALESCE(a.note, '') AS note
      FROM group_students gs
      JOIN students s ON s.id = gs.student_id
      LEFT JOIN attendance a ON a.group_id = gs.group_id AND a.student_id = s.id AND a.date = ?
      WHERE gs.group_id = ? AND gs.is_active = 1
      ORDER BY s.full_name
    `,
    [date, groupId],
  );
  return res.json(rows);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const { group_id, date, records = [] } = req.body || {};
  if (!group_id || !date || !Array.isArray(records)) {
    return res.status(400).json({ message: "group_id, date, records majburiy" });
  }

  const save = transaction(() => {
    for (const record of records) {
      const existing = get(
        "SELECT id FROM attendance WHERE group_id = ? AND student_id = ? AND date = ?",
        [group_id, record.student_id, date],
      );
      if (existing) {
        run(
          "UPDATE attendance SET status = ?, note = ? WHERE id = ?",
          [record.status, record.note || "", existing.id],
        );
      } else {
        run(
          "INSERT INTO attendance (group_id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)",
          [group_id, record.student_id, date, record.status, record.note || ""],
        );
      }
    }
  });

  save();
  return res.json({ ok: true });
});

router.get("/report", (req, res) => {
  const { group_id, month } = req.query;
  if (!group_id || !month) {
    return res.json([]);
  }
  const rows = all(
    `
      SELECT
        s.id AS student_id,
        s.full_name,
        a.date,
        a.status
      FROM group_students gs
      JOIN students s ON s.id = gs.student_id
      LEFT JOIN attendance a ON a.group_id = gs.group_id AND a.student_id = s.id AND substr(a.date, 1, 7) = ?
      WHERE gs.group_id = ? AND gs.is_active = 1
      ORDER BY s.full_name, a.date
    `,
    [month, group_id],
  );
  return res.json(rows);
});

module.exports = router;
