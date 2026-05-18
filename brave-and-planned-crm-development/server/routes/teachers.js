const express = require("express");
const { db } = require("../db/database");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", (_req, res) => {
  const teachers = db.prepare(`
    SELECT t.*, COUNT(g.id) AS group_count
    FROM teachers t
    LEFT JOIN groups g ON g.teacher_id = t.id
    GROUP BY t.id
    ORDER BY t.name
  `).all();
  res.json(teachers);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const result = db.prepare("INSERT INTO teachers (name, phone) VALUES (?, ?)").run(req.body.name, req.body.phone || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  db.prepare("UPDATE teachers SET name = ?, phone = ? WHERE id = ?").run(req.body.name, req.body.phone || null, req.params.id);
  res.json({ success: true });
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  db.prepare("DELETE FROM teachers WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
