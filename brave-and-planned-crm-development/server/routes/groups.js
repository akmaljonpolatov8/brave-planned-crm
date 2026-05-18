const express = require("express");
const { db } = require("../db/database");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", (_req, res) => {
  const groups = db.prepare(`
    SELECT g.*, t.name AS teacher_name, COUNT(s.id) AS student_count
    FROM groups g
    LEFT JOIN teachers t ON t.id = g.teacher_id
    LEFT JOIN students s ON s.group_id = g.id
    GROUP BY g.id
    ORDER BY g.name
  `).all();
  res.json(groups);
});

router.get("/:id", (req, res) => {
  const group = db.prepare(`
    SELECT g.*, t.name AS teacher_name
    FROM groups g
    LEFT JOIN teachers t ON t.id = g.teacher_id
    WHERE g.id = ?
  `).get(req.params.id);
  const students = db.prepare(`
    SELECT s.*, p.amount, p.paid, p.month
    FROM students s
    LEFT JOIN payments p ON p.student_id = s.id AND p.month = ?
    WHERE s.group_id = ?
    ORDER BY s.full_name
  `).all(new Date().toISOString().slice(0, 7), req.params.id);
  res.json({ ...group, students });
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const { name, teacher_id, course, schedule_time, schedule_days, monthly_fee } = req.body;
  const result = db.prepare(`
    INSERT INTO groups (name, teacher_id, course, schedule_time, schedule_days, monthly_fee)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, teacher_id || null, course || "", schedule_time || "", schedule_days || "", Number(monthly_fee || 0));
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const { name, teacher_id, course, schedule_time, schedule_days, monthly_fee } = req.body;
  db.prepare(`
    UPDATE groups
    SET name = ?, teacher_id = ?, course = ?, schedule_time = ?, schedule_days = ?, monthly_fee = ?
    WHERE id = ?
  `).run(name, teacher_id || null, course || "", schedule_time || "", schedule_days || "", Number(monthly_fee || 0), req.params.id);
  res.json({ success: true });
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  db.prepare("DELETE FROM groups WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post("/:id/students", roleCheck("owner", "manager"), (req, res) => {
  const { student_id, full_name, ota_phone, ona_phone, telefon } = req.body;
  if (student_id) {
    db.prepare("UPDATE students SET group_id = ? WHERE id = ?").run(req.params.id, student_id);
  } else {
    db.prepare(`
      INSERT INTO students (full_name, ota_phone, ona_phone, telefon, group_id, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(full_name, ota_phone || null, ona_phone || null, telefon || null, req.params.id);
  }
  res.json({ success: true });
});

router.delete("/:groupId/students/:studentId", roleCheck("owner", "manager"), (req, res) => {
  db.prepare("UPDATE students SET group_id = NULL WHERE id = ? AND group_id = ?").run(req.params.studentId, req.params.groupId);
  res.json({ success: true });
});

router.get("/:id/attendance", (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const records = db.prepare(`
    SELECT * FROM attendance
    WHERE group_id = ? AND substr(date, 1, 7) = ?
  `).all(req.params.id, month);
  res.json(records);
});

router.post("/:id/attendance", roleCheck("owner", "manager"), (req, res) => {
  const { student_id, date, status } = req.body;
  const existing = db.prepare("SELECT id FROM attendance WHERE student_id = ? AND group_id = ? AND date = ?").get(student_id, req.params.id, date);
  if (existing) {
    db.prepare("UPDATE attendance SET status = ? WHERE id = ?").run(status, existing.id);
  } else {
    db.prepare("INSERT INTO attendance (student_id, group_id, date, status) VALUES (?, ?, ?, ?)").run(student_id, req.params.id, date, status);
  }
  res.json({ success: true });
});

module.exports = router;
