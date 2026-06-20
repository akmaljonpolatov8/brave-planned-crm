import cron from "node-cron";
import { getDatabase } from "../db/database.js";
import { sendSMS, getParentPhone, isCredentialError } from "./smsService.js";

export function startScheduler() {
  // Every 2nd of month at 09:00 (Asia/Tashkent timezone)
  cron.schedule(
    "0 9 2 * *",
    async () => {
      console.log("🔄 Running scheduled SMS for debtors...");

      try {
        const db = getDatabase();

        // Get previous month
        const now = new Date();
        const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

        // Get all unpaid payments from previous month
        const debtors = db
          .prepare(
            `
        SELECT DISTINCT
          s.id, s.full_name, s.parent_phone, s.parent_name,
          g.name as group_name,
          SUM(p.amount) as total_amount
        FROM payments p
        JOIN students s ON p.student_id = s.id
        JOIN groups g ON p.group_id = g.id
        WHERE p.paid = 0 AND p.month = ?
        GROUP BY s.id
      `,
          )
          .all(prevMonth);

        console.log(`Found ${debtors.length} debtors for ${prevMonth}`);

        for (const debtor of debtors) {
          try {
            const parentPhone = getParentPhone(debtor);
            if (!parentPhone) continue;

            const message = `Hurmatli ${debtor.parent_name}, ${debtor.full_name}ning ${prevMonth} oyi uchun ${debtor.total_amount.toLocaleString()} so'm to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet ta'lim markazi.`;

            const result = await sendSMS(parentPhone, message);

            db.prepare(
              "INSERT INTO sms_logs (student_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?)",
            ).run(
              debtor.id,
              parentPhone,
              message,
              prevMonth,
              result.success ? "sent" : "failed",
            );

            if (result.success) {
              console.log(
                `✅ SMS sent to ${debtor.parent_name} (${parentPhone})`,
              );
            } else {
              console.error(
                `❌ Failed to send SMS to ${debtor.parent_name}:`,
                result.error,
              );
              if (isCredentialError(result.error)) {
                console.error(
                  "⛔ SMS scheduler to'xtatildi: TextUP credentials/login xatosi",
                );
                break;
              }
            }
          } catch (err) {
            console.error(
              `❌ Failed to send SMS to ${debtor.parent_name}:`,
              err.message,
            );

            db.prepare(
              "INSERT INTO sms_logs (student_id, phone, message, month, status) VALUES (?, ?, ?, ?, ?)",
            ).run(
              debtor.id,
              getParentPhone(debtor) || "",
              "",
              prevMonth,
              "failed",
            );

            if (isCredentialError(err?.message)) {
              console.error(
                "⛔ SMS scheduler to'xtatildi: TextUP credentials/login xatosi",
              );
              break;
            }
          }
        }

        console.log("✅ Scheduled SMS task completed");
      } catch (err) {
        console.error("❌ Error in scheduled SMS task:", err.message);
      }
    },
    {
      timezone: "Asia/Tashkent",
    },
  );

  console.log(
    "✅ SMS Scheduler started (runs on 2nd of each month at 09:00 Asia/Tashkent)",
  );
}
