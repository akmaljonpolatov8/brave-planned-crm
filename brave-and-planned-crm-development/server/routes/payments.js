const express = require("express");
const roleCheck = require("../middleware/roleCheck");
const { all, get, run, transaction } = require("../db/database");

const router = express.Router();

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

router.get("/", (req, res) => {
  const month = req.query.month || currentMonth();
  const groupId = req.query.group_id;
  const rows = all(
    `
      SELECT
        p.*,
        s.full_name,
        g.name AS group_name,
        CASE
          WHEN p.paid >= p.amount THEN 'paid'
          WHEN p.paid > 0 THEN 'pending'
          ELSE 'unpaid'
        END AS status
      FROM payments p
      JOIN students s ON s.id = p.student_id
      JOIN groups g ON g.id = p.group_id
      WHERE p.month = ?
        AND (? IS NULL OR p.group_id = ?)
      ORDER BY s.full_name
    `,
    [month, groupId || null, groupId || null],
  );
  return res.json(rows);
});

router.post("/generate", roleCheck("owner"), (_req, res) => {
  const month = currentMonth();
  const activeLinks = all(
    `
      SELECT
        gs.student_id,
        gs.group_id,
        g.monthly_fee
      FROM group_students gs
      JOIN groups g ON g.id = gs.group_id
      WHERE gs.is_active = 1 AND g.is_active = 1
    `,
  );

  const generate = transaction(() => {
    for (const row of activeLinks) {
      run(
        `
          INSERT INTO payments (student_id, group_id, month, amount, paid, note)
          VALUES (?, ?, ?, ?, 0, '')
          ON CONFLICT(student_id, group_id, month) DO UPDATE SET
            amount = excluded.amount
          WHERE payments.paid = 0
        `,
        [row.student_id, row.group_id, month, row.monthly_fee],
      );
    }
  });

  generate();
  return res.json({ ok: true, month });
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const current = get("SELECT * FROM payments WHERE id = ?", [req.params.id]);
  if (!current) {
    return res.status(404).json({ message: "To'lov topilmadi" });
  }

  const { paid = current.paid, note = current.note || "", amount = current.amount } = req.body || {};
  const normalized = Number(paid) || 0;
  const normalizedAmount = Number(amount) || 0;
  run(
    "UPDATE payments SET amount = ?, paid = ?, paid_at = ?, note = ? WHERE id = ?",
    [
      normalizedAmount,
      normalized,
      normalized > 0 ? new Date().toISOString() : null,
      note,
      req.params.id,
    ],
  );
  return res.json(get("SELECT * FROM payments WHERE id = ?", [req.params.id]));
});

module.exports = router;
