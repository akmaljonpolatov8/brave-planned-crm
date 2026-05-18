import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";
import { dueDateForMonth, monthKey } from "../utils/dates";
import { calculateProratedAmount } from "../utils/proration";

const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  parentPhone: z.string().min(1),
  birthDate: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "DEBT", "INACTIVE"]),
  groupId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function listStudents(req: Request, res: Response) {
  const search = String(req.query.search || "");
  const students = await prisma.student.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        }
      : undefined,
    include: {
      groupLinks: {
        where: { isActive: true },
        include: { group: true },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 6 },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return res.json(students);
}

export async function createStudent(req: Request, res: Response) {
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });

  const student = await prisma.student.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      parentPhone: parsed.data.parentPhone,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      groupLinks: parsed.data.groupId
        ? {
            create: {
              groupId: parsed.data.groupId,
            },
          }
        : undefined,
    },
    include: {
      groupLinks: { include: { group: true } },
    },
  });

  if (parsed.data.groupId) {
    const group = await prisma.group.findUniqueOrThrow({ where: { id: parsed.data.groupId } });
    await prisma.payment.create({
      data: {
        studentId: student.id,
        groupId: group.id,
        month: monthKey(new Date()),
        amountDue: group.monthlyFee,
        dueDate: dueDateForMonth(monthKey(new Date())),
        status: "UNPAID",
      },
    });
  }

  await logActivity(req.user!.id, "students", "CREATE", "Yangi o'quvchi qo'shildi", student.id);
  return res.status(201).json(student);
}

export async function updateStudent(req: Request, res: Response) {
  const id = String(req.params.id);
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });

  const student = await prisma.student.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      parentPhone: parsed.data.parentPhone,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    },
  });

  await logActivity(req.user!.id, "students", "UPDATE", "O'quvchi ma'lumoti yangilandi", student.id);
  return res.json(student);
}

export async function deleteStudent(req: Request, res: Response) {
  const id = String(req.params.id);
  await prisma.student.delete({ where: { id } });
  await logActivity(req.user!.id, "students", "DELETE", "O'quvchi o'chirildi", id);
  return res.json({ success: true });
}

export async function transferStudent(req: Request, res: Response) {
  const id = String(req.params.id);
  const schema = z.object({
    toGroupId: z.string().min(1),
    transferDate: z.string().min(1),
    note: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Transfer ma'lumotlari noto'g'ri" });

  const activeLink = await prisma.groupStudent.findFirst({
    where: { studentId: id, isActive: true },
  });
  if (!activeLink) return res.status(404).json({ message: "Talaba uchun faol guruh topilmadi" });

  const newGroup = await prisma.group.findUniqueOrThrow({ where: { id: parsed.data.toGroupId } });
  const effectiveDate = new Date(parsed.data.transferDate);
  const proratedAmount = calculateProratedAmount(newGroup.monthlyFee, effectiveDate);

  await prisma.$transaction([
    prisma.groupStudent.update({
      where: { id: activeLink.id },
      data: { isActive: false, leftAt: effectiveDate },
    }),
    prisma.groupStudent.create({
      data: {
        studentId: id,
        groupId: parsed.data.toGroupId,
        joinedAt: effectiveDate,
      },
    }),
    prisma.transfer.create({
      data: {
        studentId: id,
        fromGroupId: activeLink.groupId,
        toGroupId: parsed.data.toGroupId,
        transferDate: effectiveDate,
        proratedAmount,
        note: parsed.data.note,
      },
    }),
    prisma.payment.upsert({
      where: {
        studentId_groupId_month: {
          studentId: id,
          groupId: parsed.data.toGroupId,
          month: monthKey(effectiveDate),
        },
      },
      update: { amountDue: proratedAmount, dueDate: effectiveDate, status: "UNPAID" },
      create: {
        studentId: id,
        groupId: parsed.data.toGroupId,
        month: monthKey(effectiveDate),
        amountDue: proratedAmount,
        dueDate: effectiveDate,
        status: "UNPAID",
      },
    }),
  ]);

  await logActivity(req.user!.id, "students", "TRANSFER", "O'quvchi boshqa guruhga o'tkazildi", id);
  return res.json({ success: true, proratedAmount });
}

export async function studentPaymentHistory(req: Request, res: Response) {
  const id = String(req.params.id);
  const payments = await prisma.payment.findMany({
    where: { studentId: id },
    include: { group: true },
    orderBy: [{ month: "desc" }],
  });

  const transfers = await prisma.transfer.findMany({
    where: { studentId: id },
    include: { fromGroup: true, toGroup: true },
    orderBy: { transferDate: "desc" },
  });

  return res.json({ payments, transfers });
}
