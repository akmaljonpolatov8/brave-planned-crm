import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { sendSMS } from './smsService.js';

export function startScheduler() {
  // Every 2nd of month at 09:00 (Asia/Tashkent timezone)
  cron.schedule('0 9 2 * *', async () => {
    console.log('🔄 Running scheduled SMS for debtors...');

    try {
      const now = new Date();
      const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

      const debtors = await prisma.payment.findMany({
        where: { paid: false, month: prevMonth },
        include: {
          student: { select: { id: true, fullName: true, parentPhone: true, parentName: true, phone: true } },
          group: { select: { name: true } }
        }
      });

      console.log(`Found ${debtors.length} debtors for ${prevMonth}`);

      for (const debtor of debtors) {
        const phone = debtor.student.parentPhone || debtor.student.phone;
        if (!phone) continue;

        try {
          const message = `Hurmatli ${debtor.student.parentName || 'ota-ona'}, ${debtor.student.fullName}ning ${prevMonth} oyi uchun ${debtor.amount.toLocaleString()} so'm to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet ta'lim markazi.`;

          await sendSMS(phone, message);

          await prisma.smsLog.create({
            data: {
              studentId: debtor.student.id,
              phone,
              message,
              month: prevMonth,
              status: 'sent'
            }
          });

          console.log(`✅ SMS sent to ${debtor.student.parentName} (${phone})`);
        } catch (err) {
          console.error(`❌ Failed to send SMS to ${debtor.student.parentName}:`, err.message);

          await prisma.smsLog.create({
            data: {
              studentId: debtor.student.id,
              phone,
              message: '',
              month: prevMonth,
              status: 'failed'
            }
          });
        }
      }

      console.log('✅ Scheduled SMS task completed');
    } catch (err) {
      console.error('❌ Error in scheduled SMS task:', err.message);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  console.log('✅ SMS Scheduler started (runs on 2nd of each month at 09:00 Asia/Tashkent)');
}
