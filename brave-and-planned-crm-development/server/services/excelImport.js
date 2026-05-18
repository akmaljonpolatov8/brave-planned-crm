const XLSX = require("xlsx");
const { db, transaction } = require("../db/database");
const { normalizePhone } = require("./smsService");

const cleanPhoneValue = (value) => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw || raw === "-" || raw === "—" || raw.toLowerCase() === "nan") return null;
  return normalizePhone(raw);
};

const parseSheetName = (sheetName) => {
  const teacherMatch = sheetName.match(/\(([^()]+)\)\s*$/);
  const teacher = teacherMatch ? teacherMatch[1].trim() : null;
  const withoutTeacher = teacherMatch ? sheetName.replace(/\s*\([^()]+\)\s*$/, "").trim() : sheetName.trim();
  const timeMatch = withoutTeacher.match(/(\d{1,2}[.\-]\d{2}|\d{1,2}-\d{2})/);
  const time = timeMatch ? timeMatch[1] : "";
  const course = time ? withoutTeacher.replace(time, "").trim() : withoutTeacher;
  return {
    groupName: sheetName.trim(),
    teacherName: teacher,
    course: course.trim(),
    time,
  };
};

const getColumn = (row, variants) => {
  const key = Object.keys(row).find((item) => variants.includes(item.trim().toLowerCase()));
  return key ? row[key] : null;
};

const parseWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const groups = [];

  workbook.SheetNames.forEach((sheetName) => {
    if (sheetName.trim().toUpperCase() === "UMUMIY ROYHAT") return;
    const meta = parseSheetName(sheetName);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    const students = rows
      .map((row) => {
        const fullName = getColumn(row, ["fio", "f.i.sh", "ism familiya", "full_name", "o'quvchi", "oquvchi"]);
        if (!fullName || !String(fullName).trim()) return null;
        return {
          full_name: String(fullName).trim(),
          ota_phone: cleanPhoneValue(getColumn(row, ["ota nomeri", "ota raqami", "ota telefoni"])),
          ona_phone: cleanPhoneValue(getColumn(row, ["ona nomeri", "ona raqami", "ona telefoni"])),
          telefon: cleanPhoneValue(getColumn(row, ["telefon", "phone"])),
        };
      })
      .filter(Boolean);

    groups.push({
      ...meta,
      students,
    });
  });

  return groups;
};

const previewImport = (buffer) => {
  const groups = parseWorkbook(buffer);
  return {
    groups: groups.map((group) => ({
      name: group.groupName,
      teacher: group.teacherName,
      student_count: group.students.length,
    })),
  };
};

const saveImport = (buffer) => {
  const parsedGroups = parseWorkbook(buffer);
  let teachersCreated = 0;
  let groupsCreated = 0;
  let studentsImported = 0;

  transaction(() => {
    const findTeacher = db.prepare("SELECT id FROM teachers WHERE lower(name) = lower(?)");
    const insertTeacher = db.prepare("INSERT INTO teachers (name, phone) VALUES (?, ?)");
    const findGroup = db.prepare("SELECT id FROM groups WHERE name = ?");
    const insertGroup = db.prepare(`
      INSERT INTO groups (name, teacher_id, course, schedule_time, schedule_days, monthly_fee)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const findStudent = db.prepare("SELECT id FROM students WHERE full_name = ? AND group_id = ?");
    const insertStudent = db.prepare(`
      INSERT INTO students (full_name, ota_phone, ona_phone, telefon, group_id, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `);
    const updateStudent = db.prepare(`
      UPDATE students
      SET ota_phone = ?, ona_phone = ?, telefon = ?
      WHERE id = ?
    `);
    const ensurePayment = db.prepare(`
      INSERT INTO payments (student_id, group_id, month, amount, paid)
      SELECT ?, ?, ?, ?, 0
      WHERE NOT EXISTS (
        SELECT 1 FROM payments WHERE student_id = ? AND group_id = ? AND month = ?
      )
    `);

    parsedGroups.forEach((group) => {
      let teacherId = null;
      if (group.teacherName) {
        const teacher = findTeacher.get(group.teacherName);
        if (teacher) teacherId = teacher.id;
        else {
          teacherId = insertTeacher.run(group.teacherName, null).lastInsertRowid;
          teachersCreated += 1;
        }
      }

      let dbGroup = findGroup.get(group.groupName);
      if (!dbGroup) {
        const id = insertGroup.run(group.groupName, teacherId, group.course, group.time, "", 0).lastInsertRowid;
        dbGroup = { id };
        groupsCreated += 1;
      }

      group.students.forEach((student) => {
        const existing = findStudent.get(student.full_name, dbGroup.id);
        let studentId = null;
        if (existing) {
          studentId = existing.id;
          updateStudent.run(student.ota_phone, student.ona_phone, student.telefon, studentId);
        } else {
          studentId = insertStudent.run(student.full_name, student.ota_phone, student.ona_phone, student.telefon, dbGroup.id).lastInsertRowid;
          studentsImported += 1;
        }

        const month = new Date().toISOString().slice(0, 7);
        ensurePayment.run(studentId, dbGroup.id, month, 0, studentId, dbGroup.id, month);
      });
    });
  });

  return {
    groups_created: groupsCreated,
    teachers_created: teachersCreated,
    students_imported: studentsImported,
  };
};

module.exports = {
  previewImport,
  saveImport,
  parseWorkbook,
  parseSheetName,
};
