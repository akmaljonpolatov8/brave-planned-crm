import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";
import { studentSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        groups: { include: { group: { include: { teacher: true } } } },
      },
    });
    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can.editStudents(session.user.role as any))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = studentSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );

  try {
    await prisma.student.update({
      where: { id: params.id },
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
    if (parsed.data.groupIds) {
      await prisma.studentGroup.deleteMany({ where: { studentId: params.id } });
      const connects = parsed.data.groupIds.map((gid: string) => ({
        groupId: gid,
        studentId: params.id,
      }));
      await prisma.studentGroup.createMany({
        data: connects,
        skipDuplicates: true,
      });
    }
    const result = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        groups: { include: { group: { include: { teacher: true } } } },
      },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can.deleteStudents(session.user.role as any))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await prisma.student.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
