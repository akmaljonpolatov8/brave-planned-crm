import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";

const teacherSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  specialty: z.string().optional().nullable(),
});

export async function listTeachers(_req: Request, res: Response) {
  const teachers = await prisma.teacher.findMany({
    include: { groups: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  return res.json(teachers);
}

export async function createTeacher(req: Request, res: Response) {
  const parsed = teacherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
  const teacher = await prisma.teacher.create({ data: parsed.data });
  await logActivity(req.user!.id, "teachers", "CREATE", "Yangi o'qituvchi qo'shildi", teacher.id);
  return res.status(201).json(teacher);
}

export async function updateTeacher(req: Request, res: Response) {
  const id = String(req.params.id);
  const parsed = teacherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
  const teacher = await prisma.teacher.update({ where: { id }, data: parsed.data });
  await logActivity(req.user!.id, "teachers", "UPDATE", "O'qituvchi ma'lumoti yangilandi", teacher.id);
  return res.json(teacher);
}

export async function deleteTeacher(req: Request, res: Response) {
  const id = String(req.params.id);
  await prisma.teacher.delete({ where: { id } });
  await logActivity(req.user!.id, "teachers", "DELETE", "O'qituvchi o'chirildi", id);
  return res.json({ success: true });
}
