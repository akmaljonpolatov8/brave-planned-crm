const XLSX = require("xlsx");
const { db, get, run, transaction } = require("../db/database");

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizePhone(value) {
  const raw = normalizeText(value);
  if (!raw || raw === "вЂ”" || raw === "-") return "";
  return raw.replace(/\s+/g, "");
}

function parseTeacherFromSheet(sheetName) {
  const match = sheetName.match(/\(([^)]+)\)\s*$/);
  return normalizeText(match ? match[1] : "");
}

function parseTimeRange(value) {
  const raw = normalizeText(value).replace(/\./g, ":");
  if (!raw || raw === "вЂ”") {
    return { start: "", end: "" };
  }

  if (raw.includes("-")) {
    const [start, end] = raw.split("-").map((item) => normalizeText(item));
    return { start, end };
  }

  return { start: raw, end: "" };
}

function ensureTeacher(fullName) {
  const name = normalizeText(fullName);
  if (!name) return null;

  const existing = get("SELECT id FROM teachers WHERE full_name = ?", [name]);
  if (existing) return existing.id;

  const result = run(
    "INSERT INTO teachers (full_name, phone, username, password_hash, is_active) VALUES (?, '', NULL, NULL, 1)",
    [name],
  );
  return result.lastInsertRowid;
}

function ensureGroup({ name, teacherId, scheduleDays, startTime, endTime }) {
  const existing = get(
    `
      SELECT id FROM groups
      WHERE name = ? AND COALESCE(teacher_id, 0) = COALESCE(?, 0)
    `,
    [name, teacherId],
  );

  if (existing) {
    run(
      `
        UPDATE groups
        SET schedule_days = ?, start_time = ?, end_time = ?, is_active = 1
        WHERE id = ?
      `,
      [scheduleDays, startTime, endTime, existing.id],
    );
    return existing.id;
  }

  const result = run(
    `
      INSERT INTO groups (name, teacher_id, schedule_days, start_time, end_time, monthly_fee, is_active)
      VALUES (?, ?, ?, ?, ?, 0, 1)
    `,
    [name, teacherId, scheduleDays, startTime, endTime],
  );
  return result.lastInsertRowid;
}

function ensureStudent({ fullName, phone, parentPhone }) {
  const existing = get(
    `
      SELECT id FROM students
      WHERE full_name = ? AND COALESCE(phone, '') = ? AND COALESCE(parent_phone, '') = ?
    `,
    [fullName, phone, parentPhone],
  );

  if (existing) return existing.id;

  const result = run(
    `
      INSERT INTO students (full_name, phone, parent_phone, parent_name, status, notes)
      VALUES (?, ?, ?, '', 'active', '')
    `,
    [fullName, phone, parentPhone],
  );
  return result.lastInsertRowid;
}

function importWorkbookBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const resetData = transaction(() => {
    db.exec(`
      DELETE FROM sms_logs;
      DELETE FROM transfers;
      DELETE FROM attendance;
      DELETE FROM payments;
      DELETE FROM group_students;
      DELETE FROM groups;
      DELETE FROM students;
      DELETE FROM teachers;
    `);
  });

  const importData = transaction(() => {
    let teacherCount = 0;
    let groupCount = 0;
    let studentCount = 0;
    let membershipCount = 0;
    const teacherSeen = new Set();
    const groupSeen = new Set();

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!rows.length) continue;

      const sample = rows[0];
      const teacherName =
        normalizeText(sample["O'qituvchi"]) || parseTeacherFromSheet(sheetName);
      const timeInfo = parseTimeRange(sample["Vaqt"]);
      const scheduleDays = (() => {
        const value = normalizeText(sample["Kunlar"]);
        return value === "вЂ”" ? "" : value;
      })();

      const groupName = normalizeText(sheetName);
      const teacherId = ensureTeacher(teacherName);
      if (teacherName && !teacherSeen.has(teacherName)) {
        teacherSeen.add(teacherName);
        teacherCount += 1;
      }

      const groupId = ensureGroup({
        name: groupName,
        teacherId,
        scheduleDays,
        startTime: timeInfo.start,
        endTime: timeInfo.end,
      });
      if (!groupSeen.has(groupName)) {
        groupSeen.add(groupName);
        groupCount += 1;
      }

      for (const row of rows) {
        const fullName = normalizeText(row["Ism Familiya"]);
        if (!fullName) continue;

        const directPhone = normalizePhone(row["Telefon"]);
        const fatherPhone = normalizePhone(row["Ota nomeri"]);
        const motherPhone = normalizePhone(row["Ona nomeri"]);
        const phone = directPhone || "";
        const parentPhone = fatherPhone || motherPhone || "";

        const studentId = ensureStudent({ fullName, phone, parentPhone });
        studentCount += 1;

        const link = get(
          "SELECT id FROM group_students WHERE group_id = ? AND student_id = ?",
          [groupId, studentId],
        );

        if (link) {
          run(
            "UPDATE group_students SET is_active = 1, left_at = NULL WHERE id = ?",
            [link.id],
          );
        } else {
          run(
            "INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)",
            [groupId, studentId],
          );
        }

        membershipCount += 1;
      }
    }

    return {
      teacherCount,
      groupCount,
      studentCount,
      membershipCount,
      sheetCount: workbook.SheetNames.length,
    };
  });

  resetData();
  return importData();
}

module.exports = {
  importWorkbookBuffer,
};
