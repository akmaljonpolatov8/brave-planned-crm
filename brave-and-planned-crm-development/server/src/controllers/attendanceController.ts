import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";
import { weekRange } from "../utils/dates";

const attendanceRowSchema = z.object({
  studentId: z.string(),
  status: z.enum(["PRESENT", "ABSENT"]),
  note: z.string().optional(),
});

export async function getAttendance(req: Request, res: Response) {
  const groupId = String(req.query.groupId);
  const date = String(req.query.date);
  const records = await prisma.attendance.findMany({
    where: { groupId, date: new Date(date) },
  });
  return res.json(records);
}

export async function saveAttendance(req: Request, res: Response) {
  const schema = z.object({
    groupId: z.string(),
    date: z.string(),
    rows: z.array(attendanceRowSchema),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Davomat ma'lumoti noto'g'ri" });

  for (const row of parsed.data.rows) {
    await prisma.attendance.upsert({
      where: {
        groupId_studentId_date: {
          groupId: parsed.data.groupId,
          studentId: row.studentId,
          date: new Date(parsed.data.date),
        },
      },
      update: { status: row.status, note: row.note },
      create: {
        groupId: parsed.data.groupId,
        studentId: row.studentId,
        date: new Date(parsed.data.date),
        status: row.status,
        note: row.note,
      },
    });
  }

  await logActivity(req.user!.id, "attendance", "SAVE", "Davomat saqlandi", parsed.data.groupId);
  return res.json({ success: true });
}

export async function weeklyAttendanceReport(req: Request, res: Response) {
  const { from, to } = weekRange(
    req.query.from ? String(req.query.from) : undefined,
    req.query.to ? String(req.query.to) : undefined,
  );

  const groups = await prisma.group.findMany({
    include: {
      attendance: {
        where: { date: { gte: from, lte: to } },
      },
    },
    orderBy: { name: "asc" },
  });

  const report = groups.map((group) => {
    const present = group.attendance.filter((item) => item.status === "PRESENT").length;
    const absent = group.attendance.filter((item) => item.status === "ABSENT").length;
    const total = present + absent;
    return {
      groupId: group.id,
      groupName: group.name,
      present,
      absent,
      attendanceRate: total ? Math.round((present / total) * 100) : 0,
    };
  });

  return res.json({ from, to, report });
}
