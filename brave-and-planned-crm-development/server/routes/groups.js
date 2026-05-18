const express = require("express");
const roleCheck = require("../middleware/roleCheck");
const { all, get, run } = require("../db/database");

const router = express.Router();

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

router.get("/", (_req, res) => {
  const rows = all(
    `
      SELECT
        g.*,
        t.full_name AS teacher_name,
        COUNT(gs.student_id) AS student_count
      FROM groups g
      LEFT JOIN teachers t ON t.id = g.teacher_id
      LEFT JOIN group_students gs ON gs.group_id = g.id AND gs.is_active = 1
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `,
  );
  return res.json(rows);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const {
    name,
    teacher_id = null,
    schedule_days = "",
    start_time = "",
    end_time = "",
    monthly_fee = 0,
    is_active = 1,
  } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: "Guruh nomi majburiy" });
  }
  const result = run(
    `
      INSERT INTO groups (name, teacher_id, schedule_days, start_time, end_time, monthly_fee, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [name, teacher_id || null, schedule_days, start_time, end_time, Number(monthly_fee) || 0, is_active ? 1 : 0],
  );
  return res.status(201).json(get("SELECT * FROM groups WHERE id = ?", [result.lastInsertRowid]));
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const {
    name,
    teacher_id = null,
    schedule_days = "",
    start_time = "",
    end_time = "",
    monthly_fee = 0,
    is_active = 1,
  } = req.body || {};
  run(
    `
      UPDATE groups
      SET name = ?, teacher_id = ?, schedule_days = ?, start_time = ?, end_time = ?, monthly_fee = ?, is_active = ?
      WHERE id = ?
    `,
    [name, teacher_id || null, schedule_days, start_time, end_time, Number(monthly_fee) || 0, is_active ? 1 : 0, req.params.id],
  );
  run(
    `
      UPDATE payments
      SET amount = ?
      WHERE group_id = ? AND month = ? AND paid = 0
    `,
    [Number(monthly_fee) || 0, req.params.id, currentMonth()],
  );
  return res.json(get("SELECT * FROM groups WHERE id = ?", [req.params.id]));
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  run("DELETE FROM groups WHERE id = ?", [req.params.id]);
  return res.json({ ok: true });
});

router.get("/:id/students", (_req, res) => {
  const rows = all(
    `
      SELECT
        s.*,
        gs.joined_at
      FROM group_students gs
      JOIN students s ON s.id = gs.student_id
      WHERE gs.group_id = ? AND gs.is_active = 1
      ORDER BY s.full_name
    `,
    [_req.params.id],
  );
  return res.json(rows);
});

router.post("/:id/students", roleCheck("owner", "manager"), (req, res) => {
  const { student_id } = req.body || {};
  if (!student_id) {
    return res.status(400).json({ message: "student_id majburiy" });
  }
  const existing = get(
    "SELECT id FROM group_students WHERE group_id = ? AND student_id = ?",
    [req.params.id, student_id],
  );
  if (existing) {
    run(
      "UPDATE group_students SET is_active = 1, left_at = NULL WHERE id = ?",
      [existing.id],
    );
  } else {
    run(
      "INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)",
      [req.params.id, student_id],
    );
  }
  return res.json({ ok: true });
});

module.exports = router;
