import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { month } = req.query;
  const queryMonth = month || new Date().toISOString().substring(0, 7);

  try {
    const debtors = await prisma.payment.findMany({
      where: { paid: false, month: queryMonth },
      include: {
        student: { select: { id: true, fullName: true, phone: true, parentPhone: true, parentName: true } },
        group: { select: { name: true } }
      },
      orderBy: { student: { fullName: 'asc' } }
    });

    const result = debtors.map(p => ({
      id: p.student.id,
      full_name: p.student.fullName,
      phone: p.student.phone,
      parent_phone: p.student.parentPhone,
      parent_name: p.student.parentName,
      group_name: p.group.name,
      amount: p.amount,
      month: p.month
    }));

    // Remove duplicates by student id
    const unique = [...new Map(result.map(r => [r.id, r])).values()];
    res.json(unique);
  } catch (err) {
    console.error('Get debtors error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
