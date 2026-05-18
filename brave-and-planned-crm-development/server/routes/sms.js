import express from 'express';
import { getDatabase } from '../db/database.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { sendSMS } from '../services/smsService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { month, status } = req.query;
  const db = getDatabase();

  let query = 'SELECT * FROM sms_logs WHERE 1=1';
  const params = [];

  if (month) {
    query += ' AND month = ?';
    params.push(month);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY sent_at DESC';
  const logs = db.prepare(query).all(...params);
  res.json(logs);
});

router.post('/send-debtors', roleCheck('owner', 'manager'), async (req, res) => {
  const { month, student_ids } = req.body;
  const db = getDatabase();

  const queryMonth = month || new Date().toISOString().substring(0, 7);

  let debtors;
  if (student_ids && student_ids.length > 0) {
    const placeholders = student_ids.map(() => '?').join(',');
    debtors = db.prepare(`
      SELECT DISTINCT s.id, s.full_name, s.parent_phone, s.parent_name, g.name as group_name, p.amount
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN groups g ON p.group_id = g.id
      WHERE p.paid = 0 AND p.month = ? AND p.student_id IN (${placeholders})
    `).all(queryMonth, ...student_ids);
  } else {
    debtors = db.prepare(`
      SELECT DISTINCT s.id, s.full_name, s.parent_phone, s.parent_name, g.name as group_name, p.amount
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN groups g ON p.group_id = g.id
      WHERE p.paid = 0 AND p.month = ?
    `).all(queryMonth);
  }

  const results = [];
  for (const debtor of debtors) {
    const message = `Hurmatli ${debtor.parent_name}, ${debtor.full_name}ning ${queryMonth} oyi uchun ${debtor.amount.toLocaleString()} so'm to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet ta'lim markazi.`;
    
    try {
      await sendSMS(debtor.parent_phone, message);
      
      db.prepare('INSERT INTO sms_logs (student_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?)')
        .run(debtor.id, debtor.parent_phone, message, queryMonth, 'sent');
      
      results.push({ student_id: debtor.id, status: 'sent' });
    } catch (err) {
      db.prepare('INSERT INTO sms_logs (student_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?)')
        .run(debtor.id, debtor.parent_phone, message, queryMonth, 'failed');
      
      results.push({ student_id: debtor.id, status: 'failed', error: err.message });
    }
  }

  res.json({ message: 'SMS sending completed', results });
});

export default router;