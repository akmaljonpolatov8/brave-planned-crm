import cron from "node-cron";
import prisma from "../lib/prisma.js";
import { sendSMS, getParentPhone, isCredentialError } from "./smsService.js";

export function startScheduler() {
  // Har oyning 2-sanasi soat 09:00 da avtomatik SMS (Asia/Tashkent)
  cron.schedule(
    "0 9 2 * *",
    async () => {
      console.log("🔄 Avtomatik SMS: qarzdorlarga xabar yuborilmoqda...");

      try {
        const now = new Date();
        const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

        const debtors = await prisma.payment.findMany({
          where: { paid: false, month: prevMonth },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                parentPhone: true,
                phone: true,
                parentName: true,
              },
            },
            group: { select: { name: true } },
          },
        });

        console.log(
          `📊 ${debtors.length} ta qarzdor topildi (${prevMonth} oy)`,
        );

        let sent = 0;
        let skipped = 0;
        let failed = 0;

        for (const debtor of debtors) {
          const phone = getParentPhone(debtor.student);
          if (!phone) {
            skipped++;
            continue;
          }

          const existing = await prisma.smsLog.findFirst({
            where: {
              studentId: debtor.student.id,
              month: prevMonth,
              status: "sent",
            },
          });
          if (existing) {
            skipped++;
            continue;
          }

          const message = `Hurmatli ${debtor.student.parentName || "ota-ona"}, ${debtor.student.fullName}ning ${prevMonth} oyi uchun ${(debtor.amount || 0).toLocaleString()} so'm to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet ta'lim markazi.`;

          try {
            const result = await sendSMS(phone, message);

            await prisma.smsLog.create({
              data: {
                studentId: debtor.student.id,
                phone,
                message,
                month: prevMonth,
                status: result.success ? "sent" : "failed",
              },
            });

            if (result.success) {
              sent++;
              console.log(`  ✅ ${debtor.student.fullName} → ${phone}`);
            } else {
              failed++;
              console.log(`  ❌ ${debtor.student.fullName} → xato`);
              if (isCredentialError(result.error)) {
                console.error(
                  "⛔ Scheduler to'xtatildi: TextUP credentials/login xatosi",
                );
                break;
              }
            }
          } catch (err) {
            failed++;
            await prisma.smsLog.create({
              data: {
                studentId: debtor.student.id,
                phone,
                message: "",
                month: prevMonth,
                status: "failed",
              },
            });
            if (isCredentialError(err?.message)) {
              console.error(
                "⛔ Scheduler to'xtatildi: TextUP credentials/login xatosi",
              );
              break;
            }
          }
        }

        console.log(
          `\n📨 Natija: ${sent} yuborildi, ${skipped} o'tkazildi, ${failed} xato`,
        );
        console.log("✅ Avtomatik SMS vazifasi tugadi\n");
      } catch (err) {
        console.error("❌ Scheduler xatosi:", err.message);
      }
    },
    {
      timezone: "Asia/Tashkent",
    },
  );

  console.log("✅ SMS Scheduler — har oyning 2-sanasi 09:00 (Asia/Tashkent)");
}
