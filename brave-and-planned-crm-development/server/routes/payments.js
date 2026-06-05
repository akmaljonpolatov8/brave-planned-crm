import express from 'express';
import { getDatabase } from '../db/database.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { group_id, month } = req.query;
  const db = getDatabase();

  let query = `
    SELECT p.*, s.full_name, g.name as group_name
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN groups g ON p.group_id = g.id
    WHERE 1=1
  `;
  const params = [];

  if (group_id) {
    query += ' AND p.group_id = ?';
    params.push(group_id);
  }
  if (month) {
    query += ' AND p.month = ?';
    params.push(month);
  }

  query += ' ORDER BY p.month DESC, s.full_name';
  const payments = db.prepare(query).all(...params);
  res.json(payments);
});

router.post('/generate', roleCheck('owner'), (req, res) => {
  const db = getDatabase();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Get all active group students
  const groupStudents = db.prepare(`
    SELECT DISTINCT gs.student_id, gs.group_id, g.monthly_fee
    FROM group_students gs
    JOIN groups g ON gs.group_id = g.id
    WHERE gs.is_active = 1 AND g.is_active = 1
  `).all();

  let created = 0;
  for (const { student_id, group_id, monthly_fee } of groupStudents) {
    try {
      db.prepare(`
        INSERT INTO payments (student_id, group_id, month, amount, paid)
        VALUES (?, ?, ?, ?, 0)
      `).run(student_id, group_id, month, monthly_fee);
      created++;
    } catch (err) {
      // Already exists, skip
    }
  }

  res.json({ message: 'Payments generated', created, month });
});

router.put('/:id', roleCheck('owner', 'manager'), (req, res) => {
  const { paid, note } = req.body;
  const db = getDatabase();

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  const paid_at = paid ? new Date().toISOString() : null;
  db.prepare('UPDATE payments SET paid = ?, paid_at = ?, note = ? WHERE id = ?').run(paid ? 1 : 0, paid_at, note || payment.note, req.params.id);
  
  res.json({ id: req.params.id, paid, paid_at, note });
});

export default router;
