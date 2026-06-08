import express from 'express';
import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { sendSMS, getParentPhone, testConnection } from '../services/smsService.js';

const router = express.Router();

// Test SMS connection
router.get('/test', async (req, res) => {
  const result = await testConnection();
  res.json(result);
});

// Send SMS
router.post('/send', roleCheck('owner', 'manager'), async (req, res) => {
  const { phone, phones, groupId, message, month } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ message: "Xabar matni bo'sh" });
  }

  const currentMonth = month || new Date().toISOString().slice(0, 7);

  try {
    const recipients = [];

    if (Array.isArray(phones) && phones.length > 0) {
      phones.forEach(item => item && recipients.push({ phone: String(item), studentId: null }));
    } else if (phone) {
      recipients.push({ phone: String(phone), studentId: null });
    } else if (groupId) {
      // Get students in group
      const groupStudents = await prisma.groupStudent.findMany({
        where: { groupId: Number(groupId), isActive: true },
        include: { student: true }
      });
      groupStudents.forEach(gs => {
        const p = getParentPhone(gs.student);
        if (p) recipients.push({ phone: p, studentId: gs.student.id });
      });
    } else {
      // All students (debtors mode)
      const students = await prisma.student.findMany({
        select: { id: true, phone: true, parentPhone: true }
      });
      students.forEach(s => {
        const p = getParentPhone(s);
        if (p) recipients.push({ phone: p, studentId: s.id });
      });
    }

    // Remove duplicates by phone
    const uniqueMap = new Map();
    recipients.forEach(r => {
      if (!uniqueMap.has(r.phone)) uniqueMap.set(r.phone, r);
    });
    const uniqueRecipients = [...uniqueMap.values()];

    let sent = 0;
    let failed = 0;

    for (const recipient of uniqueRecipients) {
      const result = await sendSMS(recipient.phone, String(message));
      const status = result.success ? 'sent' : 'failed';

      // Log to database
      await prisma.smsLog.create({
        data: {
          studentId: recipient.studentId,
          phone: recipient.phone,
          message: String(message),
          month: currentMonth,
          status,
        }
      });

      if (result.success) sent++;
      else failed++;
    }

    return res.json({
      success: true,
      count: sent,
      failed,
      total: uniqueRecipients.length,
      message: `${sent} ta SMS yuborildi${failed > 0 ? `, ${failed} ta xato` : ''}`
    });
  } catch (err) {
    console.error('Send SMS error:', err);
    res.status(500).json({ message: 'Server xatolik: ' + err.message });
  }
});

// Send to debtors (auto or manual)
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
    let skipped = 0;
    let failed = 0;

    for (const debtor of debtors) {
      const phone = getParentPhone(debtor.student);
      if (!phone) { skipped++; continue; }

      // Check if already sent this month
      const existing = await prisma.smsLog.findFirst({
        where: { studentId: debtor.student.id, month, status: 'sent' }
      });
      if (existing) { skipped++; continue; }

      const message = `Hurmatli ota-ona, ${debtor.student.fullName}ning ${month} oyi uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.`;

      const result = await sendSMS(phone, message);

      await prisma.smsLog.create({
        data: {
          studentId: debtor.student.id,
          phone,
          message,
          month,
          status: result.success ? 'sent' : 'failed',
        }
      });

      if (result.success) sent++;
      else failed++;
    }

    return res.json({
      success: true,
      count: sent,
      skipped,
      failed,
      message: `${sent} ta SMS yuborildi, ${skipped} ta o'tkazildi`
    });
  } catch (err) {
    console.error('Send to debtors error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

// Get SMS logs
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
