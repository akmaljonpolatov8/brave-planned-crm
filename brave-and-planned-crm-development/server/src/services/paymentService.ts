import { prisma } from "../models/prisma";
import { dueDateForMonth, monthKey, monthLabelUz } from "../utils/dates";
import { smsService } from "./smsService";

export async function ensureCurrentMonthPayments() {
  const month = monthKey(new Date());
  const groupStudents = await prisma.groupStudent.findMany({
    where: { isActive: true },
    include: { group: true, student: true },
  });

  for (const link of groupStudents) {
    await prisma.payment.upsert({
      where: {
        studentId_groupId_month: {
          studentId: link.studentId,
          groupId: link.groupId,
          month,
        },
      },
      update: {},
      create: {
        studentId: link.studentId,
        groupId: link.groupId,
        month,
        amountDue: link.group.monthlyFee,
        dueDate: dueDateForMonth(month),
        status: "UNPAID",
      },
    });
  }
}

export async function syncStudentDebtStatuses() {
  const students = await prisma.student.findMany({
    include: {
      payments: {
        where: { status: { in: ["UNPAID", "PARTIAL"] } },
      },
    },
  });

  for (const student of students) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        status: student.payments.length > 0 ? "DEBT" : student.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });
  }
}

export async function sendMonthlyDebtNotifications() {
  const month = monthKey(new Date());
  const unpaid = await prisma.payment.findMany({
    where: {
      month,
      status: { in: ["UNPAID", "PARTIAL"] },
    },
    include: {
      student: true,
      group: true,
    },
  });

  for (const payment of unpaid) {
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

    await prisma.smsLog.create({
      data: {
        studentId: payment.studentId,
        phone: payment.student.parentPhone,
        message,
        month,
        provider: "TextUp",
        status,
        sentAt: status === "SENT" ? new Date() : null,
        responsePayload,
      },
    });
  }
}
