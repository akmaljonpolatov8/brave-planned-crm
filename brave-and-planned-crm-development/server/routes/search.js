import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();

  try {
    const students = await prisma.student.findMany({
      where: {
        fullName: { contains: q, mode: 'insensitive' }
      },
      include: {
        groups: {
          where: { isActive: true },
          include: { group: { select: { name: true } } }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    const result = students.map(s => ({
      id: s.id,
      full_name: s.fullName,
      phone: s.phone,
      parent_phone: s.parentPhone,
      group_name: s.groups.map(gs => gs.group.name).join(', ')
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
