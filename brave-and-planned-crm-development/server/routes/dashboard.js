import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const role = req.user.role;

  try {
    // Total students
    const totalStudents = await prisma.student.count();

    // Active groups
    const activeGroups = await prisma.group.count({ where: { isActive: true } });

    // Teachers count
    const teachers = await prisma.teacher.count({ where: { isActive: true } });

    // Revenue (only owner)
    let revenue = null;
    if (role === 'owner') {
      const result = await prisma.payment.aggregate({
        where: { paid: true },
        _sum: { amount: true }
      });
      revenue = result._sum.amount || 0;
    }

    // Debtors count (current month unpaid)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

    const debtors = await prisma.payment.count({
      where: { month: prevMonth, paid: false }
    });

    // Students delta (joined this month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const studentsDelta = await prisma.groupStudent.count({
      where: {
        joinedAt: { gte: monthStart, lt: monthEnd }
      }
    });

    // Last payments
    const lastPayments = await prisma.payment.findMany({
      include: {
        student: { select: { fullName: true } },
        group: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const lastPaymentsResult = lastPayments.map(p => ({
      id: p.id,
      full_name: p.student.fullName,
      group_name: p.group.name,
      amount: p.amount,
      paid: p.paid ? 1 : 0,
      paid_at: p.paidAt
    }));

    // Group status
    const groupsWithStudents = await prisma.group.findMany({
      where: { isActive: true },
      include: { students: { where: { isActive: true } } }
    });

    const groupStatus = groupsWithStudents.map(g => ({
      id: g.id,
      name: g.name,
      enrolled: g.students.length,
      capacity: g.capacity
    }));

    // Today's lessons (active groups)
    const todayAttendance = await prisma.group.findMany({
      where: { isActive: true },
      select: { id: true, name: true, startTime: true, endTime: true }
    });

    res.json({
      topStats: {
        students: totalStudents,
        groups: activeGroups,
        teachers,
        revenue,
        unpaid: debtors,
        studentsDelta
      },
      lastPayments: lastPaymentsResult,
      groupStatus: groupStatus.map(g => ({
        id: g.id,
        name: g.name,
        total: g.capacity,
        present_today: g.enrolled
      })),
      todayLessons: todayAttendance.map(g => ({
        id: g.id,
        name: g.name,
        time: g.startTime ? `${g.startTime}${g.endTime ? ' - ' + g.endTime : ''}` : null,
        marked: false,
        status: 'Kutilmoqda'
      }))
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
