import { NextResponse } from "next/server";
import XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";

const cleanPhoneValue = (value: any) => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw || raw === "-" || raw === "—" || raw.toLowerCase() === "nan")
    return null;
  // normalize simple: remove spaces and non-digits
  const cleaned = raw.replace(/[^0-9+]/g, "");
  return cleaned || null;
};

const getColumn = (row: any, variants: string[]) => {
  const key = Object.keys(row).find((item) =>
    variants.includes(item.trim().toLowerCase()),
  );
  return key ? row[key] : null;
};

const parseSheetName = (sheetName: string) => {
  const teacherMatch = sheetName.match(/\(([^()]+)\)\s*$/);
  const teacher = teacherMatch ? teacherMatch[1].trim() : null;
  const withoutTeacher = teacherMatch
    ? sheetName.replace(/\s*\([^()]+\)\s*$/, "").trim()
    : sheetName.trim();
  const timeMatch = withoutTeacher.match(/(\d{1,2}[.\-]\d{2}|\d{1,2}-\d{2})/);
  const time = timeMatch ? timeMatch[1] : "";
  const course = time
    ? withoutTeacher.replace(time, "").trim()
    : withoutTeacher;
  return {
    groupName: sheetName.trim(),
    teacherName: teacher,
    course: course.trim(),
    time,
  };
};

const parseWorkbook = (buffer: ArrayBuffer) => {
  const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });
  const groups: any[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    if (sheetName.trim().toUpperCase() === "UMUMIY ROYHAT") return;
    const meta = parseSheetName(sheetName);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
    });

    const students = rows
      .map((row: any) => {
        const fullName = getColumn(row, [
          "fio",
          "f.i.sh",
          "ism familiya",
          "full_name",
          "o'quvchi",
          "oquvchi",
        ]);
        if (!fullName || !String(fullName).trim()) return null;
        return {
          full_name: String(fullName).trim(),
          ota_phone: cleanPhoneValue(
            getColumn(row, ["ota nomeri", "ota raqami", "ota telefoni"]),
          ),
          ona_phone: cleanPhoneValue(
            getColumn(row, ["ona nomeri", "ona raqami", "ona telefoni"]),
          ),
          telefon: cleanPhoneValue(getColumn(row, ["telefon", "phone"])),
        };
      })
      .filter(Boolean);

    groups.push({ ...meta, students });
  });

  return groups;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  if (
    !contentType.includes("multipart/form-data") &&
    !contentType.includes("application/octet-stream")
  ) {
    return NextResponse.json(
      { error: "Expected file upload" },
      { status: 400 },
    );
  }

  const formData = await req.formData().catch(() => null);
  if (!formData)
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  const file = formData.get("file") as unknown as File;
  if (!file)
    return NextResponse.json({ error: "File missing" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const groups = parseWorkbook(buffer);

  return NextResponse.json({
    groups: groups.map((g) => ({
      name: g.groupName,
      teacher: g.teacherName,
      student_count: g.students.length,
    })),
  });
}
