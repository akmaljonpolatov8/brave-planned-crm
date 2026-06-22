import { Request, Response } from "express";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";
import { smsService } from "../services/smsService";
import { daysOverdue, monthKey, monthLabelUz } from "../utils/dates";

async function debtorsForMonth(month: string) {
  const payments = await prisma.payment.findMany({
    where: { month, status: { in: ["UNPAID", "PARTIAL"] } },
    include: { student: true, group: true },
    orderBy: [{ group: { name: "asc" } }, { student: { firstName: "asc" } }],
  });

  return payments.map((payment) => ({
    paymentId: payment.id,
    studentId: payment.studentId,
    studentName: `${payment.student.firstName} ${payment.student.lastName}`,
    groupName: payment.group.name,
    amountOwed: payment.amountDue - payment.amountPaid,
    daysOverdue: daysOverdue(payment.dueDate),
    parentPhone: payment.student.parentPhone,
    month: payment.month,
  }));
}

export async function listDebtors(req: Request, res: Response) {
  const month = req.query.month ? String(req.query.month) : monthKey(new Date());
  return res.json(await debtorsForMonth(month));
}

export async function sendDebtorSms(req: Request, res: Response) {
  const paymentId = String(req.params.paymentId);
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { student: true },
  });
  if (!payment) return res.status(404).json({ message: "To'lov topilmadi" });

  const message = "Hurmatli ota-ona, farzandingizning to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.\n";
  let status = "SENT";
  let responsePayload = "";
  try {
    const response = await smsService.sendSMS(payment.student.parentPhone, message);
    responsePayload = JSON.stringify(response);
  } catch (error) {
    status = "FAILED";
    responsePayload = JSON.stringify({ error: error instanceof Error ? error.message : "unknown" });
  }

  const log = await prisma.smsLog.create({
    data: {
      studentId: payment.studentId,
      phone: payment.student.parentPhone,
      message,
      month: payment.month,
      provider: "TextUp",
      status,
      sentAt: status === "SENT" ? new Date() : null,
      responsePayload,
    },
  });

  await logActivity(req.user!.id, "debtors", "SMS", "Qarzdorga SMS yuborildi", payment.studentId);
  return res.json(log);
}

export async function sendAllDebtorSms(req: Request, res: Response) {
  const month = req.body.month || monthKey(new Date());
  const debtors = await debtorsForMonth(month);
  const logs = [];
  for (const debtor of debtors) {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: debtor.paymentId }, include: { student: true } });
    const message = "Hurmatli ota-ona, farzandingizning to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.\n";
    let status = "SENT";
    let responsePayload = "";
    try {
      const response = await smsService.sendSMS(payment.student.parentPhone, message);
      responsePayload = JSON.stringify(response);
    } catch (error) {
      status = "FAILED";
      responsePayload = JSON.stringify({ error: error instanceof Error ? error.message : "unknown" });
    }
    logs.push(
      await prisma.smsLog.create({
        data: {
          studentId: payment.studentId,
          phone: payment.student.parentPhone,
          message,
          month: payment.month,
          provider: "TextUp",
          status,
          sentAt: status === "SENT" ? new Date() : null,
          responsePayload,
        },
      }),
    );
  }

  await logActivity(req.user!.id, "debtors", "BULK_SMS", "Barcha qarzdorlarga SMS yuborildi");
  return res.json({ count: logs.length, logs });
}

export async function listSmsLogs(_req: Request, res: Response) {
  const logs = await prisma.smsLog.findMany({
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json(logs);
}
