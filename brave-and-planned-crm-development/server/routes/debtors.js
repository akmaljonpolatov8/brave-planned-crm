const express = require("express");
const { all, get } = require("../db/database");

const router = express.Router();

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

router.get("/", (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = all(
    `
      SELECT
        p.id,
        p.student_id,
        p.group_id,
        p.month,
        p.amount,
        p.paid,
        s.full_name,
        s.parent_phone,
        g.name AS group_name,
        (
          SELECT status
          FROM sms_logs sl
          WHERE sl.student_id = p.student_id AND sl.month = p.month
          ORDER BY sl.sent_at DESC
          LIMIT 1
        ) AS sms_status
      FROM payments p
      JOIN students s ON s.id = p.student_id
      JOIN groups g ON g.id = p.group_id
      WHERE p.month = ? AND p.paid < p.amount
      ORDER BY s.full_name
    `,
    [month],
  );

  const stats = {
    total: rows.length,
    smsSent: rows.filter((item) => item.sms_status === "sent").length,
    month,
  };

  return res.json({ rows, stats });
});

module.exports = router;
