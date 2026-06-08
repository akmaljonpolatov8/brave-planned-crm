import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// GET /payments?group_id=X&month=YYYY-MM
// Returns students with their payment status for that group+month
router.get('/', async (req, res) => {
  const { group_id, month } = req.query;

  try {
    // If group_id provided — return students with payment status
    if (group_id && month) {
      const groupId = Number(group_id);

      // Get group fee
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { monthlyFee: true, name: true }
      });

      // Get all students in group
      const groupStudents = await prisma.groupStudent.findMany({
        where: { groupId, isActive: true },
        include: { student: { select: { id: true, fullName: true, phone: true, parentPhone: true } } },
        orderBy: { student: { fullName: 'asc' } }
      });

      // Get existing payments for this month
      const existingPayments = await prisma.payment.findMany({
        where: { groupId, month }
      });
      const paymentMap = new Map(existingPayments.map(p => [p.studentId, p]));

      // Build response
      const result = groupStudents.map(gs => {
        const payment = paymentMap.get(gs.student.id);
        return {
          id: payment?.id || null,
          student_id: gs.student.id,
          full_name: gs.student.fullName,
          phone: gs.student.phone || gs.student.parentPhone || null,
          amount: group?.monthlyFee || 0,
          paid: payment?.paid ? 1 : 0,
          paid_at: payment?.paidAt || null,
          group_name: group?.name || '',
          month,
        };
      });

      return res.json(result);
    }

    // Default — return all payments (filtered)
    const where = {};
    if (group_id) where.groupId = Number(group_id);
    if (month) where.month = month;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: { select: { fullName: true } },
        group: { select: { name: true } }
      },
      orderBy: [{ month: 'desc' }, { student: { fullName: 'asc' } }],
      take: 100
    });

    const result = payments.map(p => ({
      id: p.id,
      student_id: p.studentId,
      group_id: p.groupId,
      month: p.month,
      amount: p.amount,
      paid: p.paid ? 1 : 0,
      paid_at: p.paidAt,
      note: p.note,
      full_name: p.student.fullName,
      group_name: p.group.name
    }));

    res.json(result);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// POST /payments/toggle — toggle paid/unpaid for a student
router.post('/toggle', roleCheck('owner', 'manager'), async (req, res) => {
  const { student_id, group_id, month, paid } = req.body;

  if (!student_id || !group_id || !month) {
    return res.status(400).json({ message: 'student_id, group_id, month required' });
  }

  try {
    const studentId = Number(student_id);
    const groupId = Number(group_id);
    const isPaid = Boolean(paid);

    // Get group fee
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { monthlyFee: true }
    });

    // Upsert payment
    const payment = await prisma.payment.upsert({
      where: { studentId_groupId_month: { studentId, groupId, month } },
      update: { paid: isPaid, paidAt: isPaid ? new Date() : null },
      create: {
        studentId,
        groupId,
        month,
        amount: group?.monthlyFee || 0,
        paid: isPaid,
        paidAt: isPaid ? new Date() : null,
      }
    });

    res.json({ id: payment.id, paid: payment.paid ? 1 : 0, paid_at: payment.paidAt });
  } catch (err) {
    console.error('Toggle payment error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// PUT /payments/:id — update payment
router.put('/:id', roleCheck('owner', 'manager'), async (req, res) => {
  const { paid, note } = req.body;

  try {
    const payment = await prisma.payment.findUnique({ where: { id: Number(req.params.id) } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const paidAt = paid ? new Date() : null;
    const updated = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { paid: Boolean(paid), paidAt, note: note || payment.note }
    });

    res.json({ id: updated.id, paid: updated.paid ? 1 : 0, paid_at: updated.paidAt, note: updated.note });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// POST /payments/generate — generate payments for current month
router.post('/generate', roleCheck('owner'), async (req, res) => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const groupStudents = await prisma.groupStudent.findMany({
      where: { isActive: true, group: { isActive: true } },
      include: { group: { select: { monthlyFee: true } } }
    });

    let created = 0;
    for (const gs of groupStudents) {
      try {
        await prisma.payment.create({
          data: { studentId: gs.studentId, groupId: gs.groupId, month, amount: gs.group.monthlyFee, paid: false }
        });
        created++;
      } catch { /* Already exists */ }
    }

    res.json({ message: 'Payments generated', created, month });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
