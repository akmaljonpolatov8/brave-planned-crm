import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10)
  };
}

router.get('/weekly', async (req, res) => {
  const { from, to } = req.query.from && req.query.to ? req.query : getWeekBounds();

  try {
    const groups = await prisma.group.findMany({
      where: { isActive: true },
      include: { students: { where: { isActive: true } } }
    });

    const report = [];
    for (const group of groups) {
      const present = await prisma.attendance.count({
        where: { groupId: group.id, date: { gte: from, lte: to }, status: 'present' }
      });
      const absent = await prisma.attendance.count({
        where: { groupId: group.id, date: { gte: from, lte: to }, status: 'absent' }
      });
      const totalMarks = present + absent;

      report.push({
        group_id: group.id,
        group_name: group.name,
        total_students: group.students.length,
        present_count: present,
        absent_count: absent,
        attendance_rate: totalMarks ? Math.round((present / totalMarks) * 100) : 0
      });
    }

    res.json({ from, to, report });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
