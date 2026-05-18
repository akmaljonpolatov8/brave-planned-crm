const express = require("express");
const { db } = require("../db/database");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", (req, res) => {
  const search = (req.query.search || "").trim();
  const rows = db.prepare(`
    SELECT s.*, g.name AS group_name,
      p.amount AS payment_amount,
      p.paid AS payment_paid
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    LEFT JOIN payments p ON p.student_id = s.id AND p.month = ?
    WHERE ? = '' OR lower(s.full_name) LIKE lower(?)
    ORDER BY s.full_name
  `).all(new Date().toISOString().slice(0, 7), search, `%${search}%`);
  res.json(rows);
});

router.get("/:id", (req, res) => {
  const student = db.prepare(`
    SELECT s.*, g.name AS group_name
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE s.id = ?
  `).get(req.params.id);
  const payments = db.prepare(`
    SELECT p.*, g.name AS group_name
    FROM payments p
    LEFT JOIN groups g ON g.id = p.group_id
    WHERE p.student_id = ?
    ORDER BY p.month DESC
  `).all(req.params.id);
  const attendance = db.prepare(`
    SELECT a.*, g.name AS group_name
    FROM attendance a
    LEFT JOIN groups g ON g.id = a.group_id
    WHERE a.student_id = ?
    ORDER BY a.date DESC
  `).all(req.params.id);
  const transfers = db.prepare(`
    SELECT st.*, g1.name AS from_group_name, g2.name AS to_group_name
    FROM student_transfers st
    LEFT JOIN groups g1 ON g1.id = st.from_group_id
    LEFT JOIN groups g2 ON g2.id = st.to_group_id
    WHERE st.student_id = ?
    ORDER BY st.transferred_at DESC
  `).all(req.params.id);
  res.json({ student, payments, attendance, transfers });
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, ota_phone, ona_phone, telefon, group_id, status } = req.body;
  const result = db.prepare(`
    INSERT INTO students (full_name, ota_phone, ona_phone, telefon, group_id, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(full_name, ota_phone || null, ona_phone || null, telefon || null, group_id || null, status || "active");
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, ota_phone, ona_phone, telefon, group_id, status } = req.body;
  db.prepare(`
    UPDATE students
    SET full_name = ?, ota_phone = ?, ona_phone = ?, telefon = ?, group_id = ?, status = ?
    WHERE id = ?
  `).run(full_name, ota_phone || null, ona_phone || null, telefon || null, group_id || null, status || "active", req.params.id);
  res.json({ success: true });
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post("/:id/transfer", roleCheck("owner", "manager"), (req, res) => {
  const { to_group_id } = req.body;
  const student = db.prepare("SELECT group_id FROM students WHERE id = ?").get(req.params.id);
  db.prepare("UPDATE students SET group_id = ? WHERE id = ?").run(to_group_id, req.params.id);
  db.prepare(`
    INSERT INTO student_transfers (student_id, from_group_id, to_group_id)
    VALUES (?, ?, ?)
  `).run(req.params.id, student.group_id, to_group_id);
  res.json({ success: true });
});

module.exports = router;
