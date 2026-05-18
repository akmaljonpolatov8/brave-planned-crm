import { Request, Response } from "express";
import { prisma } from "../models/prisma";

export async function globalSearch(req: Request, res: Response) {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json([]);

  const students = await prisma.student.findMany({
    where: {
      OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }],
    },
    include: {
      groupLinks: { where: { isActive: true }, include: { group: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 10,
  });

  return res.json(
    students.map((student) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      group: student.groupLinks[0]?.group.name || "Biriktirilmagan",
      paymentStatus: student.payments[0]?.status || "YO'Q",
      phone: student.phone,
    })),
  );
}
