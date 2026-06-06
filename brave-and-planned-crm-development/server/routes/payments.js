import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { group_id, month } = req.query;

  try {
    const where = {};
    if (group_id) where.groupId = Number(group_id);
    if (month) where.month = month;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: { select: { fullName: true } },
        group: { select: { name: true } }
      },
      orderBy: [{ month: 'desc' }, { student: { fullName: 'asc' } }]
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
      created_at: p.createdAt,
      full_name: p.student.fullName,
      group_name: p.group.name
    }));

    res.json(result);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

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
          data: {
            studentId: gs.studentId,
            groupId: gs.groupId,
            month,
            amount: gs.group.monthlyFee,
            paid: false
          }
        });
        created++;
      } catch (err) {
        // Already exists (unique constraint), skip
      }
    }

    res.json({ message: 'Payments generated', created, month });
  } catch (err) {
    console.error('Generate payments error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.put('/:id', roleCheck('owner', 'manager'), async (req, res) => {
  const { paid, note } = req.body;

  try {
    const payment = await prisma.payment.findUnique({ where: { id: Number(req.params.id) } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const paidAt = paid ? new Date() : null;
    const updated = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: {
        paid: Boolean(paid),
        paidAt,
        note: note || payment.note
      }
    });

    res.json({ id: updated.id, paid: updated.paid ? 1 : 0, paid_at: updated.paidAt, note: updated.note });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
