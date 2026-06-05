import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, handlers } from "@/auth";
import { can } from "@/lib/permissions";
import { studentSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const groupId = url.searchParams.get("groupId");

  try {
    if (session.user.role === "TEACHER") {
      // get groups for teacher
      const groups = await prisma.group.findMany({
        where: { teacherId: session.user.teacherId! },
        select: { id: true },
      });
      const groupIds = groups.map((g) => g.id);
      const students = await prisma.student.findMany({
        where: {
          groups: { some: { groupId: { in: groupIds } } },
          AND: search
            ? {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search } },
                ],
              }
            : undefined,
        },
        include: {
          groups: { include: { group: { include: { teacher: true } } } },
        },
        orderBy: { lastName: "asc" },
      });
      return NextResponse.json(students);
    }

    // OWNER / MANAGER
    const where: any = {};
    if (search)
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    if (groupId) where.groups = { some: { groupId } };

    const students = await prisma.student.findMany({
      where,
      include: {
        groups: { include: { group: { include: { teacher: true } } } },
      },
      orderBy: { lastName: "asc" },
    });
    return NextResponse.json(students);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can.addStudents(session.user.role as any))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = studentSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );

  try {
    const student = await prisma.student.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone || null,
        parentPhone: parsed.data.parentPhone || null,
        parentName: parsed.data.parentName || null,
        notes: parsed.data.notes || null,
        status: parsed.data.status,
      },
    });

    if (parsed.data.groupIds && parsed.data.groupIds.length) {
      const connects = parsed.data.groupIds.map((gid: string) => ({
        groupId: gid,
        studentId: student.id,
      }));
      await prisma.studentGroup.createMany({
        data: connects,
        skipDuplicates: true,
      });
    }

    const result = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        groups: { include: { group: { include: { teacher: true } } } },
      },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
