require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db, get, run, transaction } = require("./database");

const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);
const previousMonthKey = (date = new Date()) => {
  const next = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return next.toISOString().slice(0, 7);
};

db.exec(`
DELETE FROM sms_logs;
DELETE FROM transfers;
DELETE FROM attendance;
DELETE FROM payments;
DELETE FROM group_students;
DELETE FROM students;
DELETE FROM groups;
DELETE FROM teachers;
DELETE FROM users;
`);

const hash = (value) => bcrypt.hashSync(value, 10);

const seedUsers = transaction(() => {
  const users = [
    ["Owner", "Owner", hash("MrRobben10"), "owner"],
    ["Elbek", "Elbek", hash("elbek3695"), "manager"],
    ["Doniyor", "Doniyor", hash("doniyor0000"), "manager"],
  ];

  for (const user of users) {
    run(
      "INSERT INTO users (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
      user,
    );
  }

  const teachers = [
    ["Dilnoza Karimova", "+998901112233", "teacher1", hash("teacher123")],
    ["Jasur Aliyev", "+998901112244", "teacher2", hash("teacher456")],
    ["Malika Ergasheva", "+998901112255", "teacher3", hash("teacher789")],
  ];

  for (const teacher of teachers) {
    run(
      "INSERT INTO teachers (full_name, phone, username, password_hash) VALUES (?, ?, ?, ?)",
      teacher,
    );
  }

  const teacherRows = db.prepare("SELECT id FROM teachers ORDER BY id").all();
  const groups = [
    ["Beginner A", teacherRows[0].id, "Du,Chor,Juma", "09:00", "10:30", 350000],
    ["Intermediate B", teacherRows[1].id, "Se,Pay,Shan", "11:00", "12:30", 450000],
    ["Advanced C", teacherRows[2].id, "Du,Se,Pay", "14:00", "16:00", 600000],
  ];

  for (const group of groups) {
    run(
      "INSERT INTO groups (name, teacher_id, schedule_days, start_time, end_time, monthly_fee) VALUES (?, ?, ?, ?, ?, ?)",
      group,
    );
  }

  const students = [
    ["Aziz Karimov", "+998901110001", "+998901110901", "Karim aka", "active", ""],
    ["Malika Tosheva", "+998901110002", "+998901110902", "Toshevna", "active", ""],
    ["Jasur Rahimov", "+998901110003", "+998901110903", "Rahim aka", "active", ""],
    ["Laylo Qodirova", "+998901110004", "+998901110904", "Qodirova", "active", ""],
    ["Behruz Erkinov", "+998901110005", "+998901110905", "Erkin aka", "active", ""],
    ["Shahzoda Karimova", "+998901110006", "+998901110906", "Karimova", "active", ""],
  ];

  for (const student of students) {
    run(
      "INSERT INTO students (full_name, phone, parent_phone, parent_name, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
      student,
    );
  }

  const groupRows = db.prepare("SELECT id, monthly_fee FROM groups ORDER BY id").all();
  const studentRows = db.prepare("SELECT id FROM students ORDER BY id").all();
  const links = [
    [groupRows[0].id, studentRows[0].id],
    [groupRows[0].id, studentRows[1].id],
    [groupRows[1].id, studentRows[2].id],
    [groupRows[1].id, studentRows[3].id],
    [groupRows[2].id, studentRows[4].id],
    [groupRows[2].id, studentRows[5].id],
  ];

  for (const link of links) {
    run(
      "INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)",
      link,
    );
  }

  const currentMonth = monthKey();
  const prevMonth = previousMonthKey();
  const payments = [
    [studentRows[0].id, groupRows[0].id, currentMonth, groupRows[0].monthly_fee, groupRows[0].monthly_fee, new Date().toISOString(), "To'liq to'langan"],
    [studentRows[1].id, groupRows[0].id, currentMonth, groupRows[0].monthly_fee, 0, null, ""],
    [studentRows[2].id, groupRows[1].id, currentMonth, groupRows[1].monthly_fee, 200000, new Date().toISOString(), "Qisman to'langan"],
    [studentRows[3].id, groupRows[1].id, currentMonth, groupRows[1].monthly_fee, groupRows[1].monthly_fee, new Date().toISOString(), ""],
    [studentRows[4].id, groupRows[2].id, currentMonth, groupRows[2].monthly_fee, 0, null, ""],
    [studentRows[5].id, groupRows[2].id, prevMonth, groupRows[2].monthly_fee, 0, null, "O'tgan oy qarzdor"],
  ];

  for (const payment of payments) {
    run(
      "INSERT INTO payments (student_id, group_id, month, amount, paid, paid_at, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
      payment,
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  run(
    "INSERT INTO attendance (group_id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)",
    [groupRows[0].id, studentRows[0].id, today, "present", ""],
  );
  run(
    "INSERT INTO attendance (group_id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)",
    [groupRows[0].id, studentRows[1].id, today, "late", "5 daqiqa kech"],
  );
});

seedUsers();

console.log("Database seeded");
