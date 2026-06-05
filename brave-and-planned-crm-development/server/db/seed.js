import { getDatabase, initializeDatabase } from './database.js';
import bcrypt from 'bcryptjs';

initializeDatabase();
const db = getDatabase();

// Clear existing data
db.exec('DELETE FROM sms_logs; DELETE FROM transfers; DELETE FROM payments; DELETE FROM attendance; DELETE FROM group_students; DELETE FROM groups; DELETE FROM students; DELETE FROM teachers; DELETE FROM users;');

const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Users (owner and managers)
const ownerHash = hashPassword('owner123');
const managerHash = hashPassword('manager123');

db.prepare(`
  INSERT INTO users (username, full_name, password_hash, role, is_active)
  VALUES (?, ?, ?, ?, 1)
`).run('owner', 'Rahbari', ownerHash, 'owner');

db.prepare(`
  INSERT INTO users (username, full_name, password_hash, role, is_active)
  VALUES (?, ?, ?, ?, 1)
`).run('manager1', 'Menejeri 1', managerHash, 'manager');

db.prepare(`
  INSERT INTO users (username, full_name, password_hash, role, is_active)
  VALUES (?, ?, ?, ?, 1)
`).run('manager2', 'Menejeri 2', managerHash, 'manager');

// Teachers
const teachers = [
  { full_name: 'Alisher Mustafaev', phone: '+998901234567' },
  { full_name: 'Yulia Sokolov', phone: '+998902345678' },
  { full_name: 'John Smith', phone: '+998903456789' },
  { full_name: 'Mariya Petrova', phone: '+998904567890' }
];

const teacherIds = [];
for (const teacher of teachers) {
  const result = db.prepare(`
    INSERT INTO teachers (full_name, phone, is_active)
    VALUES (?, ?, 1)
  `).run(teacher.full_name, teacher.phone);
  teacherIds.push(result.lastInsertRowid);
}

// Groups
const groups = [
  { name: 'Guruh A', teacher_id: teacherIds[0], schedule_days: 'Du,Chor,Juma', start_time: '09:00', end_time: '11:00', monthly_fee: 500000 },
  { name: 'Guruh B', teacher_id: teacherIds[1], schedule_days: 'Se,Pay,Yak', start_time: '14:00', end_time: '16:00', monthly_fee: 500000 },
  { name: 'Guruh C', teacher_id: teacherIds[2], schedule_days: 'Du,Juma', start_time: '17:00', end_time: '19:00', monthly_fee: 400000 },
  { name: 'Guruh D (Advanced)', teacher_id: teacherIds[3], schedule_days: 'Chor,Shan', start_time: '15:30', end_time: '17:30', monthly_fee: 600000 }
];

const groupIds = [];
for (const group of groups) {
  const result = db.prepare(`
    INSERT INTO groups (name, teacher_id, schedule_days, start_time, end_time, monthly_fee, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(group.name, group.teacher_id, group.schedule_days, group.start_time, group.end_time, group.monthly_fee);
  groupIds.push(result.lastInsertRowid);
}

// Students
const students = [];
const firstNames = ['Abdullayev', 'Beknazarov', 'Valiyev', 'Ganiyev', 'Davlatov', 'Ergashev', 'Firdavs', 'Habib', 'Ilkhom', 'Jahongir'];
const lastNames = ['Ahmed', 'Bakhrom', 'Vikram', 'Gavkhar', 'Dina', 'Emma', 'Fatima', 'Gina', 'Irina', 'Jasmine'];

for (let i = 0; i < 45; i++) {
  const result = db.prepare(`
    INSERT INTO students (full_name, phone, parent_phone, parent_name, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    `+998901000${String(i).padStart(3, '0')}`,
    `+998881000${String(i).padStart(3, '0')}`,
    `Ota-ona ${i}`,
    i % 15 === 0 ? 'frozen' : 'active',
    i % 20 === 0 ? 'Maxsus e\'tiborni talab qiladi' : null
  );
  students.push(result.lastInsertRowid);
}

// Assign students to groups
const studentsPerGroup = 10;
for (let i = 0; i < groupIds.length; i++) {
  for (let j = 0; j < studentsPerGroup; j++) {
    const studentIndex = i * studentsPerGroup + j;
    if (studentIndex < students.length) {
      db.prepare(`
        INSERT INTO group_students (group_id, student_id, is_active)
        VALUES (?, ?, 1)
      `).run(groupIds[i], students[studentIndex]);
    }
  }
}

// Create payments for current and previous month
const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

const months = [prevMonth, currentMonth];
for (const month of months) {
  for (let i = 0; i < students.length; i++) {
    for (let j = 0; j < groupIds.length; j++) {
      const groupStudentResult = db.prepare(`
        SELECT id FROM group_students WHERE student_id = ? AND group_id = ? AND is_active = 1
      `).get(students[i], groupIds[j]);
      
      if (groupStudentResult) {
        const groupInfo = db.prepare('SELECT monthly_fee FROM groups WHERE id = ?').get(groupIds[j]);
        const isPaid = month === prevMonth && i % 3 !== 0; // Some unpaid from previous month
        
        db.prepare(`
          INSERT OR IGNORE INTO payments (student_id, group_id, month, amount, paid, paid_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          students[i],
          groupIds[j],
          month,
          groupInfo.monthly_fee,
          isPaid ? 1 : 0,
          isPaid ? new Date().toISOString() : null
        );
      }
    }
  }
}

console.log('✅ Database seeded successfully');
console.log('\nDemo Credentials:');
console.log('  Owner: owner / owner123');
console.log('  Manager: manager1 / manager123');
console.log('\nData:');
console.log(`  Teachers: ${teacherIds.length}`);
console.log(`  Groups: ${groupIds.length}`);
console.log(`  Students: ${students.length}`);
console.log(`  Payments: Created for ${months.length} months`);
