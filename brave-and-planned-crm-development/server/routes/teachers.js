import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: { fullName: 'asc' }
    });

    const result = teachers.map(t => ({
      id: t.id,
      full_name: t.fullName,
      phone: t.phone,
      is_active: t.isActive ? 1 : 0,
      created_at: t.createdAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.json({
      id: teacher.id,
      full_name: teacher.fullName,
      phone: teacher.phone,
      is_active: teacher.isActive ? 1 : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.post('/', roleCheck('owner', 'manager'), async (req, res) => {
  const { full_name, phone } = req.body;

  if (!full_name) return res.status(400).json({ message: 'Full name required' });

  try {
    const teacher = await prisma.teacher.create({
      data: { fullName: full_name, phone: phone || null, isActive: true }
    });

    res.status(201).json({ id: teacher.id, full_name: teacher.fullName, phone: teacher.phone });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.put('/:id', roleCheck('owner', 'manager'), async (req, res) => {
  const { full_name, phone } = req.body;

  try {
    const existing = await prisma.teacher.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Teacher not found' });

    const teacher = await prisma.teacher.update({
      where: { id: Number(req.params.id) },
      data: {
        fullName: full_name || existing.fullName,
        phone: phone !== undefined ? phone : existing.phone
      }
    });

    res.json({ id: teacher.id, full_name: teacher.fullName, phone: teacher.phone });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.delete('/:id', roleCheck('owner'), async (req, res) => {
  try {
    await prisma.teacher.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false }
    });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
