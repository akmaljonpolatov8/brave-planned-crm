import express from 'express';
import { getDatabase } from '../db/database.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { group_id, date } = req.query;
  const db = getDatabase();

  let query = `
    SELECT a.*, s.full_name, g.name as group_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN groups g ON a.group_id = g.id
    WHERE 1=1
  `;
  const params = [];

  if (group_id) {
    query += ' AND a.group_id = ?';
    params.push(group_id);
  }
  if (date) {
    query += ' AND a.date = ?';
    params.push(date);
  }

  query += ' ORDER BY a.date DESC, s.full_name';
  const attendance = db.prepare(query).all(...params);
  res.json(attendance);
});

router.get('/report', (req, res) => {
  const { group_id, month } = req.query;
  const db = getDatabase();

  let query = `
    SELECT s.id, s.full_name,
           COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
           COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
           COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
           COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused,
           COUNT(a.id) as total
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id
    WHERE 1=1
  `;
  const params = [];

  if (group_id) {
    query += ' AND a.group_id = ?';
    params.push(group_id);
  }
  if (month) {
    query += ' AND strftime(\'%Y-%m\', a.date) = ?';
    params.push(month);
  }

  query += ' GROUP BY s.id ORDER BY s.full_name';
  const report = db.prepare(query).all(...params);
  res.json(report);
});

router.post('/', roleCheck('owner', 'manager'), (req, res) => {
  const { group_id, student_id, date, status, note } = req.body;

  if (!group_id || !student_id || !date || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const db = getDatabase();
  try {
    const result = db.prepare(`
      INSERT INTO attendance (group_id, student_id, date, status, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(group_id, student_id, date, status, note || null);

    res.status(201).json({ id: result.lastInsertRowid, group_id, student_id, date, status, note });
  } catch (err) {
    db.prepare('UPDATE attendance SET status = ?, note = ? WHERE group_id = ? AND student_id = ? AND date = ?').run(status, note || null, group_id, student_id, date);
    res.json({ message: 'Updated', group_id, student_id, date, status, note });
  }
});

export default router;