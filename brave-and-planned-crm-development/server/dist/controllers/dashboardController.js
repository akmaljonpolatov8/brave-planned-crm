"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const prisma_1 = require("../models/prisma");
const dates_1 = require("../utils/dates");
async function getDashboard(req, res) {
    const currentMonth = (0, dates_1.monthKey)(new Date());
    const [students, teachers, groups, payments, activities] = await Promise.all([
        prisma_1.prisma.student.count(),
        prisma_1.prisma.teacher.count(),
        prisma_1.prisma.group.count({ where: { isActive: true } }),
        prisma_1.prisma.payment.findMany({ where: { month: currentMonth }, include: { group: true } }),
        req.user?.role === "OWNER"
            ? prisma_1.prisma.activityLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 })
            : Promise.resolve([]),
    ]);
    const paid = payments.filter((item) => item.status === "PAID");
    const unpaid = payments.filter((item) => item.status !== "PAID");
    const revenue = paid.reduce((sum, item) => sum + item.amountPaid, 0);
    return res.json({
        metrics: {
            students,
            teachers,
            groups,
            paidCount: paid.length,
            unpaidCount: unpaid.length,
            ...(req.user?.role === "OWNER" ? { revenue } : {}),
        },
        activities,
    });
}
