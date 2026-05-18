import { Request, Response } from "express";
import { prisma } from "../models/prisma";
import { monthKey } from "../utils/dates";

export async function getDashboard(req: Request, res: Response) {
  const currentMonth = monthKey(new Date());
  const [students, teachers, groups, payments, activities] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.group.count({ where: { isActive: true } }),
    prisma.payment.findMany({ where: { month: currentMonth }, include: { group: true } }),
    req.user?.role === "OWNER"
      ? prisma.activityLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 })
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
