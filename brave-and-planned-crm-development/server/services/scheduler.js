const cron = require("node-cron");
const { all, run } = require("../db/database");
const { sendSMS } = require("./smsService");

function previousMonth(date = new Date()) {
  const next = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return next.toISOString().slice(0, 7);
}

async function notifyDebtorsForPreviousMonth() {
  const month = previousMonth();
  const rows = all(
    `
      SELECT
        p.id,
        p.student_id,
        p.month,
        p.amount,
        p.paid,
        s.full_name AS student_name,
        s.parent_name,
        s.parent_phone
      FROM payments p
      JOIN students s ON s.id = p.student_id
      WHERE p.month = ? AND p.paid < p.amount
    `,
    [month],
  );

  for (const row of rows) {
    const amountLeft = row.amount - row.paid;
    const message =
      `Hurmatli ${row.parent_name || "ota-ona"}, ${row.student_name}ning ${row.month} oyi uchun ` +
      `${amountLeft.toLocaleString("uz-UZ")} so'm to'lovi amalga oshirilmagan. ` +
      "Iltimos to'lovni amalga oshiring. Brave and Planet ta'lim markazi.";

    const result = await sendSMS(row.parent_phone, message);
    run(
      "INSERT INTO sms_logs (student_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?)",
      [
        row.student_id,
        row.parent_phone,
        message,
        row.month,
        result.ok ? "sent" : "error",
      ],
    );
  }
}

function startScheduler() {
  cron.schedule(
    "0 9 2 * *",
    async () => {
      await notifyDebtorsForPreviousMonth();
    },
    { timezone: "Asia/Tashkent" },
  );
}

module.exports = {
  startScheduler,
  notifyDebtorsForPreviousMonth,
};
