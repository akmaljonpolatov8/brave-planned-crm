import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";

const groupSchema = z.object({
  name: z.string().min(1),
  teacherId: z.string().min(1),
  schedule: z.string().min(1),
  monthlyFee: z.number().int().min(0),
  startDate: z.string().min(1),
  isActive: z.boolean().default(true),
});

export async function listGroups(_req: Request, res: Response) {
  const groups = await prisma.group.findMany({
    include: {
      teacher: true,
      students: {
        where: { isActive: true },
        include: { student: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return res.json(groups);
}

export async function createGroup(req: Request, res: Response) {
  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
  const group = await prisma.group.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
    },
  });
  await logActivity(req.user!.id, "groups", "CREATE", "Yangi guruh yaratildi", group.id);
  return res.status(201).json(group);
}

export async function updateGroup(req: Request, res: Response) {
  const id = String(req.params.id);
  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
  const group = await prisma.group.update({
    where: { id },
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
    },
  });
  await logActivity(req.user!.id, "groups", "UPDATE", "Guruh yangilandi", group.id);
  return res.json(group);
}

export async function deleteGroup(req: Request, res: Response) {
  const id = String(req.params.id);
  await prisma.group.delete({ where: { id } });
  await logActivity(req.user!.id, "groups", "DELETE", "Guruh o'chirildi", id);
  return res.json({ success: true });
}

export async function getRoster(req: Request, res: Response) {
  const id = String(req.params.id);
  const roster = await prisma.groupStudent.findMany({
    where: { groupId: id, isActive: true },
    include: { student: true },
    orderBy: { joinedAt: "asc" },
  });
  return res.json(roster);
}
