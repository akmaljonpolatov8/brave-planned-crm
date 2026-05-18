import express from 'express';
import { getDatabase } from '../db/database.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDatabase();
  const teachers = db.prepare('SELECT * FROM teachers WHERE is_active = 1 ORDER BY full_name').all();
  res.json(teachers);
});

router.get('/:id', (req, res) => {
  const db = getDatabase();
  const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
  
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  res.json(teacher);
});

router.post('/', roleCheck('owner', 'manager'), (req, res) => {
  const { full_name, phone } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name required' });
  }

  const db = getDatabase();
  const result = db.prepare('INSERT INTO teachers (full_name, phone, is_active) VALUES (?, ?, 1)').run(full_name, phone || null);
  res.status(201).json({ id: result.lastInsertRowid, full_name, phone });
});

router.put('/:id', roleCheck('owner', 'manager'), (req, res) => {
  const { full_name, phone } = req.body;
  const db = getDatabase();

  const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  db.prepare('UPDATE teachers SET full_name = ?, phone = ? WHERE id = ?').run(full_name || teacher.full_name, phone !== undefined ? phone : teacher.phone, req.params.id);
  res.json({ id: req.params.id, full_name, phone });
});

router.delete('/:id', roleCheck('owner'), (req, res) => {
  const db = getDatabase();
  db.prepare('UPDATE teachers SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Teacher deleted' });
});

export default router;