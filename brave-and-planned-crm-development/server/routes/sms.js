const express = require("express");
const roleCheck = require("../middleware/roleCheck");
const { all, get, run } = require("../db/database");
const { sendSMS } = require("../services/smsService");

const router = express.Router();

function buildDebtMessage(row) {
  const debt = row.amount - row.paid;
  return (
    `Hurmatli ${row.parent_name || "ota-ona"}, ${row.full_name}ning ${row.month} oyi uchun ` +
    `${debt.toLocaleString("uz-UZ")} so'm to'lovi amalga oshirilmagan. ` +
    "Iltimos to'lovni amalga oshiring. Brave and Planet ta'lim markazi."
  );
}

router.post("/send-debtors", roleCheck("owner", "manager"), async (req, res) => {
  const { month, payment_ids = [] } = req.body || {};
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
        s.parent_name
      FROM payments p
      JOIN students s ON s.id = p.student_id
      WHERE p.month = ?
        AND p.paid < p.amount
        AND (${payment_ids.length ? `p.id IN (${payment_ids.map(() => "?").join(",")})` : "1 = 1"})
    `,
    [month, ...payment_ids],
  );

  const results = [];
  for (const row of rows) {
    const message = buildDebtMessage(row);
    const result = await sendSMS(row.parent_phone, message);
    run(
      "INSERT INTO sms_logs (student_id, group_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?, ?)",
      [row.student_id, row.group_id, row.parent_phone, message, row.month, result.ok ? "sent" : "error"],
    );
    results.push({ payment_id: row.id, ok: result.ok });
  }

  return res.json({ ok: true, results });
});

router.get("/logs", (req, res) => {
  const { month = "", status = "", group_id = "" } = req.query;
  const rows = all(
    `
      SELECT
        sl.*,
        s.full_name,
        g.name AS group_name
      FROM sms_logs sl
      LEFT JOIN students s ON s.id = sl.student_id
      LEFT JOIN groups g ON g.id = sl.group_id
      WHERE (? = '' OR sl.month = ?)
        AND (? = '' OR sl.status = ?)
        AND (? = '' OR CAST(sl.group_id AS TEXT) = ?)
      ORDER BY sl.sent_at DESC
    `,
    [month, month, status, status, group_id, group_id],
  );

  return res.json({
    rows,
    stats: {
      total: rows.length,
      sent: rows.filter((item) => item.status === "sent").length,
      error: rows.filter((item) => item.status === "error").length,
    },
  });
});

router.post("/:id/resend", roleCheck("owner", "manager"), async (req, res) => {
  const row = get("SELECT * FROM sms_logs WHERE id = ?", [req.params.id]);
  if (!row) {
    return res.status(404).json({ message: "SMS log topilmadi" });
  }
  const result = await sendSMS(row.phone, row.message);
  run(
    "INSERT INTO sms_logs (student_id, group_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?, ?)",
    [row.student_id, row.group_id || null, row.phone, row.message, row.month, result.ok ? "sent" : "error"],
  );
  return res.json({ ok: result.ok });
});

module.exports = router;
