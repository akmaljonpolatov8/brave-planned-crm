const express = require("express");
const { db } = require("../db/database");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const groupId = req.query.group_id || null;
  const rows = db
    .prepare(
      `
    SELECT p.*, s.full_name, g.name AS group_name
    FROM payments p
    JOIN students s ON s.id = p.student_id
    LEFT JOIN groups g ON g.id = p.group_id
    WHERE p.month = ? AND (? IS NULL OR p.group_id = ?)
    ORDER BY s.full_name
  `,
    )
    .all(month, groupId, groupId);

  const summary =
    req.user.role === "owner"
      ? db
          .prepare(
            `
          SELECT COALESCE(SUM(amount), 0) AS total_revenue,
                 COUNT(CASE WHEN paid = 1 THEN 1 END) AS paid_count,
                 COUNT(CASE WHEN paid = 0 THEN 1 END) AS unpaid_count
          FROM payments
          WHERE month = ? AND (? IS NULL OR group_id = ?)
        `,
          )
          .get(month, groupId, groupId)
      : null;

  res.json({ rows, summary });
});

router.patch("/:id/pay", roleCheck("owner", "manager"), (req, res) => {
  db.prepare(
    "UPDATE payments SET paid = 1, paid_at = datetime('now') WHERE id = ?",
  ).run(req.params.id);
  res.json({ success: true });
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const { amount } = req.body;
  db.prepare("UPDATE payments SET amount = ? WHERE id = ?").run(
    Number(amount),
    req.params.id,
  );
  res.json({ success: true });
});

module.exports = router;
