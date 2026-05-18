const express = require("express");
const roleCheck = require("../middleware/roleCheck");
const { all, get, run, transaction } = require("../db/database");

const router = express.Router();

router.get("/", (_req, res) => {
  const rows = all(
    `
      SELECT
        s.*,
        g.name AS group_name,
        g.id AS group_id
      FROM students s
      LEFT JOIN group_students gs ON gs.student_id = s.id AND gs.is_active = 1
      LEFT JOIN groups g ON g.id = gs.group_id
      ORDER BY s.created_at DESC
    `,
  );
  return res.json(rows);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, phone, parent_phone, parent_name, status = "active", notes = "" } = req.body || {};
  if (!full_name) {
    return res.status(400).json({ message: "F.I.SH majburiy" });
  }
  const result = run(
    "INSERT INTO students (full_name, phone, parent_phone, parent_name, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [full_name, phone || "", parent_phone || "", parent_name || "", status, notes],
  );
  return res.status(201).json(get("SELECT * FROM students WHERE id = ?", [result.lastInsertRowid]));
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, phone, parent_phone, parent_name, status = "active", notes = "" } = req.body || {};
  run(
    `
      UPDATE students
      SET full_name = ?, phone = ?, parent_phone = ?, parent_name = ?, status = ?, notes = ?
      WHERE id = ?
    `,
    [full_name, phone || "", parent_phone || "", parent_name || "", status, notes, req.params.id],
  );
  return res.json(get("SELECT * FROM students WHERE id = ?", [req.params.id]));
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  run("DELETE FROM students WHERE id = ?", [req.params.id]);
  return res.json({ ok: true });
});

router.post("/:id/transfer", roleCheck("owner", "manager"), (req, res) => {
  const { from_group_id, to_group_id, note = "" } = req.body || {};
  if (!from_group_id || !to_group_id) {
    return res.status(400).json({ message: "from_group_id va to_group_id majburiy" });
  }

  const transferStudent = transaction(() => {
    run(
      "UPDATE group_students SET is_active = 0, left_at = datetime('now') WHERE student_id = ? AND group_id = ? AND is_active = 1",
      [req.params.id, from_group_id],
    );

    const existing = get(
      "SELECT id FROM group_students WHERE student_id = ? AND group_id = ?",
      [req.params.id, to_group_id],
    );

    if (existing) {
      run(
        "UPDATE group_students SET is_active = 1, left_at = NULL, joined_at = datetime('now') WHERE id = ?",
        [existing.id],
      );
    } else {
      run(
        "INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)",
        [to_group_id, req.params.id],
      );
    }

    run(
      "INSERT INTO transfers (student_id, from_group_id, to_group_id, note, done_by) VALUES (?, ?, ?, ?, ?)",
      [req.params.id, from_group_id, to_group_id, note, req.user.role === "owner" ? req.user.id : null],
    );
  });

  transferStudent();
  return res.json({ ok: true });
});

module.exports = router;
