import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { sendSMS } from '../services/smsService.js';

const router = express.Router();

async function sendAndLog(studentId, phone, message, month) {
  try {
    const result = await sendSMS(phone, message);
    const status = result?.success === false ? 'failed' : 'sent';

    await prisma.smsLog.create({
      data: {
        studentId: studentId || null,
        phone,
        message,
        month: month || null,
        status
      }
    });

    return { ...result, status };
  } catch (err) {
    await prisma.smsLog.create({
      data: {
        studentId: studentId || null,
        phone,
        message,
        month: month || null,
        status: 'failed'
      }
    });
    return { success: false, status: 'failed' };
  }
}

router.post('/send', roleCheck('owner', 'manager'), async (req, res) => {
  const { phone, phones, groupId, message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ message: "Xabar matni bo'sh" });
  }

  try {
    const recipients = [];

    if (Array.isArray(phones)) {
      phones.forEach(item => item && recipients.push(String(item)));
    } else if (phone) {
      recipients.push(String(phone));
    } else if (groupId) {
      const students = await prisma.groupStudent.findMany({
        where: { groupId: Number(groupId), isActive: true },
        include: { student: true }
      });
      students.forEach(gs => {
        const p = gs.student.parentPhone || gs.student.phone;
        if (p) recipients.push(p);
      });
    }

    const uniqueRecipients = [...new Set(recipients)];
    let sent = 0;

    for (const recipient of uniqueRecipients) {
      await sendAndLog(null, recipient, String(message), null);
      sent += 1;
    }

    return res.json({ success: true, count: sent });
  } catch (err) {
    console.error('Send SMS error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.post('/send-to-debtors', roleCheck('owner', 'manager'), async (req, res) => {
  const month = req.body.month || new Date().toISOString().slice(0, 7);

  try {
    const debtors = await prisma.payment.findMany({
      where: { paid: false, month },
      include: {
        student: { select: { id: true, fullName: true, parentPhone: true, phone: true } }
      }
    });

    let sent = 0;
    for (const debtor of debtors) {
      const phone = debtor.student.parentPhone || debtor.student.phone;
      if (!phone) continue;
      const message = `Hurmatli ota-ona, ${debtor.student.fullName}ning ${month} oyi uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.`;
      await sendAndLog(debtor.student.id, phone, message, month);
      sent += 1;
    }

    return res.json({ success: true, count: sent });
  } catch (err) {
    console.error('Send to debtors error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.smsLog.findMany({
      include: { student: { select: { fullName: true } } },
      orderBy: { sentAt: 'desc' },
      take: 100
    });

    const result = logs.map(l => ({
      id: l.id,
      student_id: l.studentId,
      student_name: l.student?.fullName || null,
      phone: l.phone,
      message: l.message,
      month: l.month,
      status: l.status,
      sent_at: l.sentAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

export default router;
