const express = require("express");
const { db } = require("../db/database");
const { sendSMS, getParentPhone } = require("../services/smsService");
const { buildMonthlyMessage } = require("../services/scheduler");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

function getDebtors(month) {
  return db.prepare(`
    SELECT p.id AS payment_id, p.amount, p.month, s.*, g.name AS group_name,
           CAST(julianday('now') - julianday(p.month || '-02') AS INTEGER) AS days_overdue
    FROM payments p
    JOIN students s ON s.id = p.student_id
    LEFT JOIN groups g ON g.id = p.group_id
    WHERE p.month = ? AND p.paid = 0
    ORDER BY g.name, s.full_name
  `).all(month).map((row) => ({
    ...row,
    parent_phone: getParentPhone(row),
  }));
}

router.get("/", (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  res.json(getDebtors(month));
});

router.post("/:paymentId/send", roleCheck("owner", "manager"), async (req, res) => {
  const row = db.prepare(`
    SELECT p.id AS payment_id, p.amount, p.month, s.*
    FROM payments p
    JOIN students s ON s.id = p.student_id
    WHERE p.id = ?
  `).get(req.params.paymentId);
  const phone = getParentPhone(row);
  const message = buildMonthlyMessage(row.full_name, row.month);
  let status = "sent";
  try {
    await sendSMS(phone, message);
  } catch (error) {
    status = "failed";
  }
  db.prepare("INSERT INTO sms_logs (student_id, phone, message, status) VALUES (?, ?, ?, ?)").run(row.id, phone, message, status);
  res.json({ success: true, status, sent_at: new Date().toISOString() });
});

router.post("/send-all", roleCheck("owner", "manager"), async (req, res) => {
  const month = req.body.month || new Date().toISOString().slice(0, 7);
  const debtors = getDebtors(month);
  for (const row of debtors) {
    const message = buildMonthlyMessage(row.full_name, row.month);
    let status = "sent";
    try {
      await sendSMS(row.parent_phone, message);
    } catch (error) {
      status = "failed";
    }
    db.prepare("INSERT INTO sms_logs (student_id, phone, message, status) VALUES (?, ?, ?, ?)").run(row.id, row.parent_phone, message, status);
  }
  res.json({ success: true, count: debtors.length });
});

module.exports = router;
