import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: { isActive: true },
      include: {
        students: { where: { isActive: true } },
        teacher: { select: { fullName: true } }
      },
      orderBy: { name: 'asc' }
    });

    const result = groups.map(g => ({
      id: g.id,
      name: g.name,
      teacher_id: g.teacherId,
      teacher_name: g.teacher?.fullName || null,
      schedule_days: g.scheduleDays,
      start_time: g.startTime,
      end_time: g.endTime,
      monthly_fee: g.monthlyFee,
      capacity: g.capacity,
      is_active: g.isActive ? 1 : 0,
      student_count: g.students.length,
      created_at: g.createdAt
    }));

    res.json(result);
  } catch (err) {
    console.error('Get groups error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({
      id: group.id,
      name: group.name,
      teacher_id: group.teacherId,
      schedule_days: group.scheduleDays,
      start_time: group.startTime,
      end_time: group.endTime,
      monthly_fee: group.monthlyFee,
      capacity: group.capacity,
      is_active: group.isActive ? 1 : 0,
      created_at: group.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.get('/:id/students', async (req, res) => {
  try {
    const groupStudents = await prisma.groupStudent.findMany({
      where: { groupId: Number(req.params.id), isActive: true },
      include: { student: true },
      orderBy: { student: { fullName: 'asc' } }
    });

    const result = groupStudents.map(gs => ({
      id: gs.student.id,
      full_name: gs.student.fullName,
      phone: gs.student.phone,
      parent_phone: gs.student.parentPhone,
      parent_name: gs.student.parentName,
      status: gs.student.status,
      notes: gs.student.notes
    }));

    res.json(result);
  } catch (err) {
    console.error('Get group students error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.post('/', roleCheck('owner', 'manager'), async (req, res) => {
  const {
    name, teacher_id, teacherId, schedule_days, scheduleDays,
    start_time, startTime, end_time, endTime,
    monthly_fee, monthlyFee, capacity, is_active, isActive
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Group name required' });
  }

  try {
    const group = await prisma.group.create({
      data: {
        name,
        teacherId: teacher_id ?? teacherId ?? null,
        scheduleDays: schedule_days ?? scheduleDays ?? null,
        startTime: start_time ?? startTime ?? null,
        endTime: end_time ?? endTime ?? null,
        monthlyFee: monthly_fee ?? monthlyFee ?? 0,
        capacity: capacity ?? 20,
        isActive: is_active !== undefined ? Boolean(is_active) : isActive !== undefined ? Boolean(isActive) : true
      }
    });

    res.status(201).json({
      id: group.id,
      name: group.name,
      teacher_id: group.teacherId,
      schedule_days: group.scheduleDays,
      start_time: group.startTime,
      end_time: group.endTime,
      monthly_fee: group.monthlyFee,
      capacity: group.capacity,
      is_active: group.isActive ? 1 : 0
    });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.put('/:id', roleCheck('owner', 'manager'), async (req, res) => {
  const {
    name, teacher_id, teacherId, schedule_days, scheduleDays,
    start_time, startTime, end_time, endTime,
    monthly_fee, monthlyFee, capacity, is_active, isActive
  } = req.body;

  try {
    const existing = await prisma.group.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const group = await prisma.group.update({
      where: { id: Number(req.params.id) },
      data: {
        name: name || existing.name,
        teacherId: teacher_id !== undefined ? teacher_id : teacherId !== undefined ? teacherId : existing.teacherId,
        scheduleDays: schedule_days !== undefined ? schedule_days : scheduleDays !== undefined ? scheduleDays : existing.scheduleDays,
        startTime: start_time !== undefined ? start_time : startTime !== undefined ? startTime : existing.startTime,
        endTime: end_time !== undefined ? end_time : endTime !== undefined ? endTime : existing.endTime,
        monthlyFee: monthly_fee !== undefined ? monthly_fee : monthlyFee !== undefined ? monthlyFee : existing.monthlyFee,
        capacity: capacity !== undefined ? capacity : existing.capacity,
        isActive: is_active !== undefined ? Boolean(is_active) : isActive !== undefined ? Boolean(isActive) : existing.isActive
      }
    });

    res.json({
      id: group.id,
      name: group.name,
      teacher_id: group.teacherId,
      schedule_days: group.scheduleDays,
      start_time: group.startTime,
      end_time: group.endTime,
      monthly_fee: group.monthlyFee,
      capacity: group.capacity,
      is_active: group.isActive ? 1 : 0
    });
  } catch (err) {
    console.error('Update group error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.delete('/:id', roleCheck('owner'), async (req, res) => {
  try {
    await prisma.group.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false }
    });
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.post('/:id/students', roleCheck('owner', 'manager'), async (req, res) => {
  const { student_id } = req.body;
  const groupId = Number(req.params.id);

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const student = await prisma.student.findUnique({ where: { id: Number(student_id) } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const gs = await prisma.groupStudent.upsert({
      where: { groupId_studentId: { groupId, studentId: Number(student_id) } },
      update: { isActive: true, leftAt: null },
      create: { groupId, studentId: Number(student_id), isActive: true }
    });

    res.status(201).json({ id: gs.id, group_id: groupId, student_id });
  } catch (err) {
    console.error('Add student to group error:', err);
    res.status(400).json({ message: 'Student already in group' });
  }
});

export default router;
