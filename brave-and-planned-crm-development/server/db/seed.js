const bcrypt = require("bcryptjs");
const { db, initializeDatabase, transaction } = require("./database");

initializeDatabase();

const currentMonth = new Date().toISOString().slice(0, 7);

transaction(() => {
  db.exec(`
    DELETE FROM sms_logs;
    DELETE FROM student_transfers;
    DELETE FROM refresh_tokens;
    DELETE FROM attendance;
    DELETE FROM payments;
    DELETE FROM students;
    DELETE FROM groups;
    DELETE FROM teachers;
    DELETE FROM users;
  `);

  const users = [
    ["owner", bcrypt.hashSync("owner123", 10), "owner"],
    ["manager1", bcrypt.hashSync("manager123", 10), "manager"],
    ["manager2", bcrypt.hashSync("manager123", 10), "manager"],
  ];
  const insertUser = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
  users.forEach((row) => insertUser.run(...row));

  const insertTeacher = db.prepare("INSERT INTO teachers (name, phone) VALUES (?, ?)");
  const teacherIds = [
    insertTeacher.run("Azizbek", "+998901110101").lastInsertRowid,
    insertTeacher.run("Mohira", "+998901110102").lastInsertRowid,
    insertTeacher.run("Doston", "+998901110103").lastInsertRowid,
  ];

  const insertGroup = db.prepare(`
    INSERT INTO groups (name, teacher_id, course, schedule_time, schedule_days, monthly_fee)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const groups = [
    ["Pre IELTS 16.00 (Azizbek)", teacherIds[0], "Pre IELTS", "16.00", "Du-Chor-Ju", 700000],
    ["Beginner 14-16 (Mohira)", teacherIds[1], "Beginner", "14-16", "Se-Pay-Sha", 500000],
    ["Kids 10.00 (Doston)", teacherIds[2], "Kids", "10.00", "Du-Cho", 450000],
    ["Elementary 18.00 (Azizbek)", teacherIds[0], "Elementary", "18.00", "Se-Pay", 550000],
    ["Intermediate 20.00 (Mohira)", teacherIds[1], "Intermediate", "20.00", "Du-Chor-Ju", 650000],
  ].map((group) => insertGroup.run(...group).lastInsertRowid);

  const insertStudent = db.prepare(`
    INSERT INTO students (full_name, ota_phone, ona_phone, telefon, group_id, status, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const studentNames = [
    "Ali Karimov","Madina Ergasheva","Sardor Toirov","Muslima Qodirova","Jasur Yusupov",
    "Rayhona Komilova","Oybek Rahimov","Umida Saidova","Shahzod Rustamov","Parizoda Tursunova",
    "Aziza Murodova","Diyor Islomov","Nozima Jo'rayeva","Temur Xasanov","Sevinch Raxmonova",
    "Muhammadali Erkinov","Malika Sobirova","Mironshoh Jalolov","Asilbek Baratov","Sabina Sodiqova"
  ];

  const studentIds = studentNames.map((name, index) => {
    const groupId = groups[index % groups.length];
    return insertStudent.run(
      name,
      index % 3 === 0 ? `+99890${String(1000000 + index).padStart(7, "0")}` : null,
      index % 3 !== 0 ? `+99891${String(2000000 + index).padStart(7, "0")}` : null,
      index % 5 === 0 ? `+7${String(9000000000 + index)}` : null,
      groupId,
      index % 4 === 0 ? "debt" : "active",
      `2026-0${(index % 5) + 1}-0${(index % 8) + 1}`
    ).lastInsertRowid;
  });

  const insertPayment = db.prepare(`
    INSERT INTO payments (student_id, group_id, month, amount, paid, paid_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  studentIds.forEach((studentId, index) => {
    const groupId = groups[index % groups.length];
    const groupFee = [700000, 500000, 450000, 550000, 650000][index % groups.length];
    const paid = index % 4 === 0 ? 0 : 1;
    insertPayment.run(studentId, groupId, currentMonth, groupFee, paid, paid ? new Date().toISOString() : null);
  });

  const insertAttendance = db.prepare(`
    INSERT INTO attendance (student_id, group_id, date, status)
    VALUES (?, ?, ?, ?)
  `);
  studentIds.forEach((studentId, index) => {
    const groupId = groups[index % groups.length];
    for (let day = 12; day <= 16; day += 1) {
      insertAttendance.run(studentId, groupId, `2026-05-${day}`, (index + day) % 5 === 0 ? "absent" : "present");
    }
  });
});

console.log("Seed completed");
