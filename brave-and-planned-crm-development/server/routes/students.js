import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
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
      parent_name: s.parentName,
      status: s.status,
      notes: s.notes,
      created_at: s.createdAt,
      groups: s.groups.map(gs => gs.group.name).join(', ')
    }));

    res.json(result);
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      id: student.id,
      full_name: student.fullName,
      phone: student.phone,
      parent_phone: student.parentPhone,
      parent_name: student.parentName,
      status: student.status,
      notes: student.notes,
      created_at: student.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Create student
router.post('/', roleCheck('owner', 'manager'), async (req, res) => {
  const { full_name, phone, parent_phone, parent_name, status, notes } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name required' });
  }

  try {
    const student = await prisma.student.create({
      data: {
        fullName: full_name,
        phone: phone || null,
        parentPhone: parent_phone || null,
        parentName: parent_name || null,
        status: status || 'active',
        notes: notes || null
      }
    });

    res.status(201).json({
      id: student.id,
      full_name: student.fullName,
      phone: student.phone,
      parent_phone: student.parentPhone,
      parent_name: student.parentName,
      status: student.status,
      notes: student.notes
    });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Update student
router.put('/:id', roleCheck('owner', 'manager'), async (req, res) => {
  const { full_name, phone, parent_phone, parent_name, status, notes } = req.body;

  try {
    const existing = await prisma.student.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = await prisma.student.update({
      where: { id: Number(req.params.id) },
      data: {
        fullName: full_name || existing.fullName,
        phone: phone !== undefined ? phone : existing.phone,
        parentPhone: parent_phone !== undefined ? parent_phone : existing.parentPhone,
        parentName: parent_name !== undefined ? parent_name : existing.parentName,
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes
      }
    });

    res.json({
      id: student.id,
      full_name: student.fullName,
      phone: student.phone,
      parent_phone: student.parentPhone,
      parent_name: student.parentName,
      status: student.status,
      notes: student.notes
    });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Delete student
router.delete('/:id', roleCheck('owner'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await prisma.student.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Transfer student to another group
router.post('/:id/transfer', roleCheck('owner', 'manager'), async (req, res) => {
  const { from_group_id, to_group_id, fromGroupId, toGroupId, note } = req.body;
  const studentId = Number(req.params.id);

  const sourceGroupId = Number(from_group_id || fromGroupId);
  const targetGroupId = Number(to_group_id || toGroupId);

  if (!sourceGroupId || !targetGroupId) {
    return res.status(400).json({ message: 'from_group_id and to_group_id required' });
  }

  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Deactivate old group membership
    await prisma.groupStudent.updateMany({
      where: { studentId, groupId: sourceGroupId, isActive: true },
      data: { isActive: false, leftAt: new Date() }
    });

    // Create new group membership
    await prisma.groupStudent.upsert({
      where: { groupId_studentId: { groupId: targetGroupId, studentId } },
      update: { isActive: true, leftAt: null, joinedAt: new Date() },
      create: { groupId: targetGroupId, studentId, isActive: true }
    });

    // Log transfer
    await prisma.transfer.create({
      data: {
        studentId,
        fromGroupId: sourceGroupId,
        toGroupId: targetGroupId,
        note: note || null,
        doneBy: req.user.id
      }
    });

    res.json({ message: 'Student transferred' });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
