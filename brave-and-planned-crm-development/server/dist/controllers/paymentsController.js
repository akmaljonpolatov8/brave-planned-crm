"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPayments = listPayments;
exports.markAsPaid = markAsPaid;
exports.updatePayment = updatePayment;
const zod_1 = require("zod");
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const dates_1 = require("../utils/dates");
async function listPayments(req, res) {
    const groupId = req.query.groupId ? String(req.query.groupId) : undefined;
    const month = req.query.month ? String(req.query.month) : (0, dates_1.monthKey)(new Date());
    const payments = await prisma_1.prisma.payment.findMany({
        where: {
            month,
            ...(groupId ? { groupId } : {}),
        },
        include: {
            student: true,
            group: true,
        },
        orderBy: [{ group: { name: "asc" } }, { student: { firstName: "asc" } }],
    });
    const rows = payments.map((payment) => ({
        ...payment,
        amountDue: payment.amountDue,
        amountPaid: payment.amountPaid,
    }));
    const response = { rows };
    if (req.user?.role === "OWNER") {
        response.summary = {
            totalRevenue: payments.reduce((sum, item) => sum + item.amountPaid, 0),
            totalExpected: payments.reduce((sum, item) => sum + item.amountDue, 0),
            paidCount: payments.filter((item) => item.status === "PAID").length,
            unpaidCount: payments.filter((item) => item.status !== "PAID").length,
        };
    }
    return res.json(response);
}
async function markAsPaid(req, res) {
    const id = String(req.params.id);
    const payment = await prisma_1.prisma.payment.update({
        where: { id },
        data: {
            status: "PAID",
            amountPaid: req.body.amountPaid ?? undefined,
            paidAt: new Date(),
        },
    });
    await (0, activityLogService_1.logActivity)(req.user.id, "payments", "PAID", "To'lov qabul qilindi", payment.id);
    return res.json(payment);
}
async function updatePayment(req, res) {
    const id = String(req.params.id);
    const schema = zod_1.z.object({
        amountDue: zod_1.z.number().int().min(0),
        amountPaid: zod_1.z.number().int().min(0),
        month: zod_1.z.string().min(1),
        status: zod_1.z.enum(["PAID", "UNPAID", "PARTIAL"]),
        note: zod_1.z.string().optional().nullable(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "To'lov ma'lumotlari noto'g'ri" });
    const payment = await prisma_1.prisma.payment.update({
        where: { id },
        data: {
            amountDue: parsed.data.amountDue,
            amountPaid: parsed.data.amountPaid,
            month: parsed.data.month,
            dueDate: (0, dates_1.dueDateForMonth)(parsed.data.month),
            status: parsed.data.status,
            paidAt: parsed.data.status === "PAID" ? new Date() : null,
            note: parsed.data.note || null,
        },
    });
    await (0, activityLogService_1.logActivity)(req.user.id, "payments", "UPDATE", "To'lov tahrirlandi", payment.id);
    return res.json(payment);
}
