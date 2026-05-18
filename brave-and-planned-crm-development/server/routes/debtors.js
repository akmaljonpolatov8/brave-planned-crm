import express from 'express';
import { getDatabase } from '../db/database.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { month } = req.query;
  const db = getDatabase();

  const queryMonth = month || new Date().toISOString().substring(0, 7);

  const debtors = db.prepare(`
    SELECT DISTINCT
      s.id, s.full_name, s.phone, s.parent_phone, s.parent_name,
      g.name as group_name,
      p.amount, p.month
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN groups g ON p.group_id = g.id
    WHERE p.paid = 0 AND p.month = ?
    ORDER BY s.full_name
  `).all(queryMonth);

  res.json(debtors);
});

export default router;