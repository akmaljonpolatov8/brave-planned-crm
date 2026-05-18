"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCurrentMonthPayments = ensureCurrentMonthPayments;
exports.syncStudentDebtStatuses = syncStudentDebtStatuses;
exports.sendMonthlyDebtNotifications = sendMonthlyDebtNotifications;
const prisma_1 = require("../models/prisma");
const dates_1 = require("../utils/dates");
const smsService_1 = require("./smsService");
async function ensureCurrentMonthPayments() {
    const month = (0, dates_1.monthKey)(new Date());
    const groupStudents = await prisma_1.prisma.groupStudent.findMany({
        where: { isActive: true },
        include: { group: true, student: true },
    });
    for (const link of groupStudents) {
        await prisma_1.prisma.payment.upsert({
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
                dueDate: (0, dates_1.dueDateForMonth)(month),
                status: "UNPAID",
            },
        });
    }
}
async function syncStudentDebtStatuses() {
    const students = await prisma_1.prisma.student.findMany({
        include: {
            payments: {
                where: { status: { in: ["UNPAID", "PARTIAL"] } },
            },
        },
    });
    for (const student of students) {
        await prisma_1.prisma.student.update({
            where: { id: student.id },
            data: {
                status: student.payments.length > 0 ? "DEBT" : student.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
            },
        });
    }
}
async function sendMonthlyDebtNotifications() {
    const month = (0, dates_1.monthKey)(new Date());
    const unpaid = await prisma_1.prisma.payment.findMany({
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
        const message = `Hurmatli ota-ona, ${payment.student.firstName} ning ${(0, dates_1.monthLabelUz)(month)} uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet`;
        let status = "SENT";
        let responsePayload = "";
        try {
            const response = await smsService_1.smsService.sendSMS(payment.student.parentPhone, message);
            responsePayload = JSON.stringify(response);
        }
        catch (error) {
            status = "FAILED";
            responsePayload = JSON.stringify({ error: error instanceof Error ? error.message : "unknown" });
        }
        await prisma_1.prisma.smsLog.create({
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
