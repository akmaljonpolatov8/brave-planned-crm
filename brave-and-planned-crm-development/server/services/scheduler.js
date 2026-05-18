const cron = require("node-cron");
const { db } = require("../db/database");
const { sendSMS, getParentPhone } = require("./smsService");

const buildMonthlyMessage = (fullName, month) =>
  `Hurmatli ota-ona, ${fullName}ning ${month} oyi uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.`;

async function sendMonthlyDebtNotifications() {
  const month = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  const students = db
    .prepare(
      `
    SELECT s.*, p.id AS payment_id, p.amount, g.name AS group_name
    FROM payments p
    JOIN students s ON s.id = p.student_id
    LEFT JOIN groups g ON g.id = p.group_id
    WHERE p.month = ? AND p.paid = 0
  `,
    )
    .all(month);

  const insertLog = db.prepare(`
    INSERT INTO sms_logs (student_id, phone, message, status, sent_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  for (const student of students) {
    const phone = getParentPhone(student);
    const message = buildMonthlyMessage(student.full_name, month);
    try {
      await sendSMS(phone, message);
      insertLog.run(student.id, phone, message, "sent");
    } catch (error) {
      insertLog.run(student.id, phone, message, "failed");
    }
  }
}

function startScheduler() {
  cron.schedule(
    "1 0 * * *",
    async () => {
      const day = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Tashkent",
          day: "2-digit",
        }).format(new Date()),
      );
      if (day === 2) {
        await sendMonthlyDebtNotifications();
      }
    },
    { timezone: "Asia/Tashkent" },
  );
}

module.exports = {
  startScheduler,
  sendMonthlyDebtNotifications,
  buildMonthlyMessage,
};
