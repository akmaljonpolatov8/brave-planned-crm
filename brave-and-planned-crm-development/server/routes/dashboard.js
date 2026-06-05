import express from 'express';
import { getDatabase } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDatabase();
  const role = req.user.role;

  // Total students
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;

  // Active groups
  const activeGroups = db.prepare('SELECT COUNT(*) as count FROM groups WHERE is_active = 1').get().count;

  // Teachers count
  const teachers = db.prepare('SELECT COUNT(*) as count FROM teachers WHERE is_active = 1').get().count;

  // Revenue (only owner)
  let revenue = null;
  if (role === 'owner') {
    const result = db.prepare(`
      SELECT SUM(amount) as total FROM payments WHERE paid = 1
    `).get();
    revenue = result.total || 0;
  }

  // Debtors count (previous month unpaid)
  const now = new Date();
  const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
  
  const debtors = db.prepare(`
    SELECT COUNT(DISTINCT student_id) as count FROM payments 
    WHERE month = ? AND paid = 0
  `).get(prevMonth).count;

  // Students delta (this month)
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const studentsDelta = db.prepare(`
    SELECT COUNT(DISTINCT student_id) as count FROM group_students 
    WHERE joined_at >= ? AND joined_at < ?
  `).get(`${currentMonth}-01`, `${currentMonth}-32`).count;

  // Last payments
  const lastPayments = db.prepare(`
    SELECT 
      p.id, s.full_name, g.name as group_name, p.amount, p.paid, p.paid_at
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN groups g ON p.group_id = g.id
    ORDER BY p.created_at DESC
    LIMIT 10
  `).all();

  // Group status (percentage of students vs capacity)
  const groupStatus = db.prepare(`
    SELECT 
      g.id, g.name,
      COUNT(gs.id) as enrolled,
      20 as capacity
    FROM groups g
    LEFT JOIN group_students gs ON g.id = gs.group_id AND gs.is_active = 1
    WHERE g.is_active = 1
    GROUP BY g.id
  `).all();

  // Today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = db.prepare(`
    SELECT DISTINCT g.id, g.name, g.start_time, g.end_time
    FROM groups g
    WHERE g.is_active = 1
  `).all();

  res.json({
    topStats: {
      students: totalStudents,
      groups: activeGroups,
      teachers,
      revenue,
      debtors,
      studentsDelta
    },
    lastPayments,
    groupStatus,
    todayAttendance
  });
});

export default router;
