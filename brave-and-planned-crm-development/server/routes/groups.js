import express from 'express';
import { getDatabase } from '../db/database.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDatabase();
  const groups = db.prepare(`
    SELECT 
      g.*,
      COUNT(gs.id) as student_count
    FROM groups g
    LEFT JOIN group_students gs ON g.id = gs.group_id AND gs.is_active = 1
    WHERE g.is_active = 1
    GROUP BY g.id
    ORDER BY g.name
  `).all();
  res.json(groups);
});

router.get('/:id', (req, res) => {
  const db = getDatabase();
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
  
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  res.json(group);
});

router.get('/:id/students', (req, res) => {
  const db = getDatabase();
  const students = db.prepare(`
    SELECT s.* FROM students s
    JOIN group_students gs ON s.id = gs.student_id
    WHERE gs.group_id = ? AND gs.is_active = 1
    ORDER BY s.full_name
  `).all(req.params.id);
  res.json(students);
});

router.post('/', roleCheck('owner', 'manager'), (req, res) => {
  const { name, teacher_id, schedule_days, start_time, end_time, monthly_fee } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Group name required' });
  }

  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO groups (name, teacher_id, schedule_days, start_time, end_time, monthly_fee, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(name, teacher_id || null, schedule_days || null, start_time || null, end_time || null, monthly_fee || 0);

  res.status(201).json({ id: result.lastInsertRowid, name, teacher_id, schedule_days, start_time, end_time, monthly_fee });
});

router.put('/:id', roleCheck('owner', 'manager'), (req, res) => {
  const { name, teacher_id, schedule_days, start_time, end_time, monthly_fee } = req.body;
  const db = getDatabase();

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  db.prepare(`
    UPDATE groups 
    SET name = ?, teacher_id = ?, schedule_days = ?, start_time = ?, end_time = ?, monthly_fee = ?
    WHERE id = ?
  `).run(
    name || group.name,
    teacher_id !== undefined ? teacher_id : group.teacher_id,
    schedule_days !== undefined ? schedule_days : group.schedule_days,
    start_time !== undefined ? start_time : group.start_time,
    end_time !== undefined ? end_time : group.end_time,
    monthly_fee !== undefined ? monthly_fee : group.monthly_fee,
    req.params.id
  );

  res.json({ id: req.params.id, name, teacher_id, schedule_days, start_time, end_time, monthly_fee });
});

router.delete('/:id', roleCheck('owner'), (req, res) => {
  const db = getDatabase();
  db.prepare('UPDATE groups SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Group deleted' });
});

router.post('/:id/students', roleCheck('owner', 'manager'), (req, res) => {
  const { student_id } = req.body;
  const groupId = req.params.id;
  const db = getDatabase();

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  try {
    const result = db.prepare('INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)').run(groupId, student_id);
    res.status(201).json({ id: result.lastInsertRowid, group_id: groupId, student_id });
  } catch (err) {
    return res.status(400).json({ message: 'Student already in group' });
  }
});

export default router;