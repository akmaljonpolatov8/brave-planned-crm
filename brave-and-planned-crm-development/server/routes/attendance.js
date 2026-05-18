const express = require("express");
const { db } = require("../db/database");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

function upsertAttendance(groupId, studentId, date, status) {
  const existing = db
    .prepare("SELECT id FROM attendance WHERE student_id = ? AND date = ?")
    .get(studentId, date);

  if (existing) {
    db.prepare(
      "UPDATE attendance SET group_id = ?, status = ? WHERE id = ?",
    ).run(groupId, status, existing.id);
  } else {
    db.prepare(
      "INSERT INTO attendance (student_id, group_id, date, status) VALUES (?, ?, ?, ?)",
    ).run(studentId, groupId, date, status);
  }
}

router.get("/month/:groupId/:month", (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.student_id, a.group_id, a.date, a.status, s.full_name
     FROM attendance a
     JOIN students s ON s.id = a.student_id
     WHERE a.group_id = ? AND substr(a.date, 1, 7) = ?
     ORDER BY s.full_name, a.date`,
    )
    .all(req.params.groupId, req.params.month);
  res.json(rows);
});

router.get("/:groupId/:date", (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.student_id, a.group_id, a.date, a.status, s.full_name
     FROM attendance a
     JOIN students s ON s.id = a.student_id
     WHERE a.group_id = ? AND a.date = ?
     ORDER BY s.full_name`,
    )
    .all(req.params.groupId, req.params.date);
  res.json(rows);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const groupId = Number(req.body.groupId);
  const date = String(req.body.date);

  if (Array.isArray(req.body.rows)) {
    req.body.rows.forEach((row) => {
      if (!row.studentId || !row.status) return;
      upsertAttendance(groupId, Number(row.studentId), date, row.status);
    });
    return res.json({ success: true });
  }

  const { studentId, status } = req.body;
  if (!groupId || !studentId || !date || !status) {
    return res
      .status(400)
      .json({ message: "Attendance ma'lumotlari noto'g'ri" });
  }

  upsertAttendance(groupId, Number(studentId), date, status);
  return res.json({ success: true });
});

router.get("/report", (req, res) => {
  const from = req.query.from || new Date().toISOString().slice(0, 10);
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const rows = db
    .prepare(
      `SELECT g.id AS group_id, g.name AS group_name,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_count,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent_count
     FROM groups g
     LEFT JOIN attendance a ON a.group_id = g.id AND a.date BETWEEN ? AND ?
     GROUP BY g.id
     ORDER BY g.name`,
    )
    .all(from, to);

  res.json({ from, to, report: rows });
});

module.exports = router;
