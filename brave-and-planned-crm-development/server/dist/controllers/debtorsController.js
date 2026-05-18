"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDebtors = listDebtors;
exports.sendDebtorSms = sendDebtorSms;
exports.sendAllDebtorSms = sendAllDebtorSms;
exports.listSmsLogs = listSmsLogs;
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const smsService_1 = require("../services/smsService");
const dates_1 = require("../utils/dates");
async function debtorsForMonth(month) {
    const payments = await prisma_1.prisma.payment.findMany({
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
        daysOverdue: (0, dates_1.daysOverdue)(payment.dueDate),
        parentPhone: payment.student.parentPhone,
        month: payment.month,
    }));
}
async function listDebtors(req, res) {
    const month = req.query.month ? String(req.query.month) : (0, dates_1.monthKey)(new Date());
    return res.json(await debtorsForMonth(month));
}
async function sendDebtorSms(req, res) {
    const paymentId = String(req.params.paymentId);
    const payment = await prisma_1.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { student: true },
    });
    if (!payment)
        return res.status(404).json({ message: "To'lov topilmadi" });
    const message = `Hurmatli ota-ona, ${payment.student.firstName} ning ${(0, dates_1.monthLabelUz)(payment.month)} uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet`;
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
    const log = await prisma_1.prisma.smsLog.create({
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
    await (0, activityLogService_1.logActivity)(req.user.id, "debtors", "SMS", "Qarzdorga SMS yuborildi", payment.studentId);
    return res.json(log);
}
async function sendAllDebtorSms(req, res) {
    const month = req.body.month || (0, dates_1.monthKey)(new Date());
    const debtors = await debtorsForMonth(month);
    const logs = [];
    for (const debtor of debtors) {
        const payment = await prisma_1.prisma.payment.findUniqueOrThrow({ where: { id: debtor.paymentId }, include: { student: true } });
        const message = `Hurmatli ota-ona, ${payment.student.firstName} ning ${(0, dates_1.monthLabelUz)(payment.month)} uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet`;
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
        logs.push(await prisma_1.prisma.smsLog.create({
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
        }));
    }
    await (0, activityLogService_1.logActivity)(req.user.id, "debtors", "BULK_SMS", "Barcha qarzdorlarga SMS yuborildi");
    return res.json({ count: logs.length, logs });
}
async function listSmsLogs(_req, res) {
    const logs = await prisma_1.prisma.smsLog.findMany({
        include: { student: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
    return res.json(logs);
}
