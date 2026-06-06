import express from "express";
import { db } from "../db/database.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { sendSMS, getParentPhone } from "../services/smsService.js";

const router = express.Router();

async function sendAndLog(studentId, phone, message) {
  const result = await sendSMS(phone, message);
  const status = result?.success === false ? "failed" : "sent";

  db.prepare(
    "INSERT INTO sms_logs (student_id, phone, message, status) VALUES (?, ?, ?, ?)",
  ).run(studentId ?? null, phone, message, status);

  return { ...result, status };
}

router.post("/send", roleCheck("owner", "manager"), async (req, res) => {
  const { phone, phones, groupId, message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ message: "Xabar matni bo'sh" });
  }

  const recipients = [];

  if (Array.isArray(phones)) {
    phones.forEach((item) => item && recipients.push(String(item)));
  } else if (phone) {
    recipients.push(String(phone));
  } else if (groupId) {
    const students = db
      .prepare("SELECT * FROM students WHERE group_id = ? ORDER BY full_name")
      .all(groupId);
    students.forEach((student) => {
      const parentPhone = getParentPhone(student);
      if (parentPhone) recipients.push(parentPhone);
    });
  } else {
    const students = db
      .prepare("SELECT * FROM students ORDER BY full_name")
      .all();
    students.forEach((student) => {
      const parentPhone = getParentPhone(student);
      if (parentPhone) recipients.push(parentPhone);
    });
  }

  const uniqueRecipients = [...new Set(recipients)];
  let sent = 0;

  for (const recipient of uniqueRecipients) {
    await sendAndLog(null, recipient, String(message));
    sent += 1;
  }

  return res.json({ success: true, count: sent });
});

router.post(
  "/send-to-debtors",
  roleCheck("owner", "manager"),
  async (req, res) => {
    const month = req.body.month || new Date().toISOString().slice(0, 7);
    const debtors = db
      .prepare(
        `SELECT p.id AS payment_id, p.amount, p.month, s.*
     FROM payments p
     JOIN students s ON s.id = p.student_id
     WHERE p.month = ? AND p.paid = 0
     ORDER BY s.full_name`,
      )
      .all(month);

    let sent = 0;
    for (const debtor of debtors) {
      const phone = getParentPhone(debtor);
      if (!phone) continue;
      const message = `Hurmatli ota-ona, ${debtor.full_name}ning ${month} oyi uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.`;
      await sendAndLog(debtor.id, phone, message);
      sent += 1;
    }

    return res.json({ success: true, count: sent });
  },
);

router.get("/logs", (req, res) => {
  const logs = db
    .prepare(
      `SELECT l.*, s.full_name AS student_name
     FROM sms_logs l
     LEFT JOIN students s ON s.id = l.student_id
     ORDER BY l.sent_at DESC
     LIMIT 100`,
    )
    .all();

  res.json(logs);
});

export default router;
