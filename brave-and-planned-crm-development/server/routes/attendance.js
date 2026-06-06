import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// Get attendance for a group + month
router.get('/month/:groupId/:month', async (req, res) => {
  try {
    const { groupId, month } = req.params;
    const records = await prisma.attendance.findMany({
      where: {
        groupId: Number(groupId),
        date: { startsWith: month }
      },
      include: { student: { select: { fullName: true } } },
      orderBy: [{ student: { fullName: 'asc' } }, { date: 'asc' }]
    });

    const result = records.map(a => ({
      student_id: a.studentId,
      group_id: a.groupId,
      date: a.date,
      status: a.status,
      full_name: a.student.fullName
    }));

    res.json(result);
  } catch (err) {
    console.error('Get month attendance error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Get attendance for a group + date
router.get('/:groupId/:date', async (req, res) => {
  try {
    const { groupId, date } = req.params;
    const records = await prisma.attendance.findMany({
      where: { groupId: Number(groupId), date },
      include: { student: { select: { fullName: true } } },
      orderBy: { student: { fullName: 'asc' } }
    });

    const result = records.map(a => ({
      student_id: a.studentId,
      group_id: a.groupId,
      date: a.date,
      status: a.status,
      full_name: a.student.fullName
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Save attendance
router.post('/', roleCheck('owner', 'manager', 'teacher'), async (req, res) => {
  const groupId = Number(req.body.groupId);
  const date = String(req.body.date);

  try {
    if (Array.isArray(req.body.rows)) {
      for (const row of req.body.rows) {
        if (!row.studentId || !row.status) continue;
        await prisma.attendance.upsert({
          where: {
            groupId_studentId_date: {
              groupId,
              studentId: Number(row.studentId),
              date
            }
          },
          update: { status: row.status },
          create: { groupId, studentId: Number(row.studentId), date, status: row.status }
        });
      }
      return res.json({ success: true });
    }

    const { studentId, status } = req.body;
    if (!groupId || !studentId || !date || !status) {
      return res.status(400).json({ message: "Attendance ma'lumotlari noto'g'ri" });
    }

    await prisma.attendance.upsert({
      where: {
        groupId_studentId_date: { groupId, studentId: Number(studentId), date }
      },
      update: { status },
      create: { groupId, studentId: Number(studentId), date, status }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Save attendance error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Attendance report
router.get('/report', async (req, res) => {
  const from = req.query.from || new Date().toISOString().slice(0, 10);
  const to = req.query.to || new Date().toISOString().slice(0, 10);

  try {
    const groups = await prisma.group.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
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
