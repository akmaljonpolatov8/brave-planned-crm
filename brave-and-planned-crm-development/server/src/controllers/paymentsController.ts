import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";
import { dueDateForMonth, monthKey } from "../utils/dates";

export async function listPayments(req: Request, res: Response) {
  const groupId = req.query.groupId ? String(req.query.groupId) : undefined;
  const month = req.query.month ? String(req.query.month) : monthKey(new Date());
  const payments = await prisma.payment.findMany({
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

  const response: Record<string, unknown> = { rows };
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

export async function markAsPaid(req: Request, res: Response) {
  const id = String(req.params.id);
  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status: "PAID",
      amountPaid: req.body.amountPaid ?? undefined,
      paidAt: new Date(),
    },
  });
  await logActivity(req.user!.id, "payments", "PAID", "To'lov qabul qilindi", payment.id);
  return res.json(payment);
}

export async function updatePayment(req: Request, res: Response) {
  const id = String(req.params.id);
  const schema = z.object({
    amountDue: z.number().int().min(0),
    amountPaid: z.number().int().min(0),
    month: z.string().min(1),
    status: z.enum(["PAID", "UNPAID", "PARTIAL"]),
    note: z.string().optional().nullable(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "To'lov ma'lumotlari noto'g'ri" });

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      amountDue: parsed.data.amountDue,
      amountPaid: parsed.data.amountPaid,
      month: parsed.data.month,
      dueDate: dueDateForMonth(parsed.data.month),
      status: parsed.data.status,
      paidAt: parsed.data.status === "PAID" ? new Date() : null,
      note: parsed.data.note || null,
    },
  });

  await logActivity(req.user!.id, "payments", "UPDATE", "To'lov tahrirlandi", payment.id);
  return res.json(payment);
}
