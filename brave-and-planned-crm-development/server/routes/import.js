import express from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';
import XLSX from 'xlsx';

const router = express.Router();
const upload = multer();

function normalizePhone(raw) {
  if (!raw) return null;
  let phone = String(raw).replace(/[\s\-\(\)]/g, '');
  if (phone.startsWith('+')) phone = phone.slice(1);
  if (phone.startsWith('998') && phone.length === 12) return '+' + phone;
  if (phone.startsWith('7') && phone.length === 11) return '+' + phone;
  if (phone.length === 9 && /^\d+$/.test(phone)) return '+998' + phone;
  return '+' + phone;
}

function cleanPhoneValue(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw || raw === '-' || raw === '—' || raw.toLowerCase() === 'nan') return null;
  return normalizePhone(raw);
}

function parseSheetName(sheetName) {
  const teacherMatch = sheetName.match(/\(([^()]+)\)\s*$/);
  const teacher = teacherMatch ? teacherMatch[1].trim() : null;
  const withoutTeacher = teacherMatch ? sheetName.replace(/\s*\([^()]+\)\s*$/, '').trim() : sheetName.trim();
  const timeMatch = withoutTeacher.match(/(\d{1,2}[.\-]\d{2}|\d{1,2}-\d{2})/);
  const time = timeMatch ? timeMatch[1] : '';
  const course = time ? withoutTeacher.replace(time, '').trim() : withoutTeacher;
  return { groupName: sheetName.trim(), teacherName: teacher, course: course.trim(), time };
}

function getColumn(row, variants) {
  const key = Object.keys(row).find(item => variants.includes(item.trim().toLowerCase()));
  return key ? row[key] : null;
}

function parseWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const groups = [];

  workbook.SheetNames.forEach(sheetName => {
    if (sheetName.trim().toUpperCase() === 'UMUMIY ROYHAT') return;
    const meta = parseSheetName(sheetName);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const students = rows.map(row => {
      const fullName = getColumn(row, ['fio', 'f.i.sh', 'ism familiya', 'full_name', "o'quvchi", 'oquvchi']);
      if (!fullName || !String(fullName).trim()) return null;
      return {
        full_name: String(fullName).trim(),
        parent_phone: cleanPhoneValue(getColumn(row, ['ota nomeri', 'ota raqami', 'ota telefoni'])),
        phone: cleanPhoneValue(getColumn(row, ['telefon', 'phone']))
      };
    }).filter(Boolean);

    groups.push({ ...meta, students });
  });

  return groups;
}

router.post('/excel/preview', roleCheck('owner', 'manager'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Fayl topilmadi' });

  const groups = parseWorkbook(req.file.buffer);
  res.json({
    groups: groups.map(g => ({
      name: g.groupName,
      teacher: g.teacherName,
      student_count: g.students.length
    }))
  });
});

router.post('/excel', roleCheck('owner', 'manager'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Fayl topilmadi' });

  try {
    const parsedGroups = parseWorkbook(req.file.buffer);
    let teachersCreated = 0;
    let groupsCreated = 0;
    let studentsImported = 0;

    for (const g of parsedGroups) {
      let teacherId = null;
      if (g.teacherName) {
        let teacher = await prisma.teacher.findFirst({
          where: { fullName: { equals: g.teacherName, mode: 'insensitive' } }
        });
        if (!teacher) {
          teacher = await prisma.teacher.create({ data: { fullName: g.teacherName, isActive: true } });
          teachersCreated++;
        }
        teacherId = teacher.id;
      }

      let group = await prisma.group.findFirst({ where: { name: g.groupName } });
      if (!group) {
        group = await prisma.group.create({
          data: {
            name: g.groupName,
            teacherId,
            scheduleDays: '',
            startTime: g.time || null,
            monthlyFee: 0,
            isActive: true
          }
        });
        groupsCreated++;
      }

      for (const s of g.students) {
        let student = null;
        if (s.phone) {
          student = await prisma.student.findFirst({ where: { phone: s.phone } });
        }
        if (!student) {
          student = await prisma.student.create({
            data: {
              fullName: s.full_name,
              phone: s.phone,
              parentPhone: s.parent_phone,
              status: 'active'
            }
          });
          studentsImported++;
        }

        // Link to group
        await prisma.groupStudent.upsert({
          where: { groupId_studentId: { groupId: group.id, studentId: student.id } },
          update: { isActive: true },
          create: { groupId: group.id, studentId: student.id, isActive: true }
        });
      }
    }

    res.json({ groups_created: groupsCreated, teachers_created: teachersCreated, students_imported: studentsImported });
  } catch (err) {
    console.error('Excel import error:', err);
    res.status(500).json({ message: 'Import xatolik' });
  }
});

export default router;
