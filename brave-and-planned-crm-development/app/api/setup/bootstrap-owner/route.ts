import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { bootstrapSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bootstrapSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Validation failed" }, { status: 400 });
    }

    const existingOwner = await prisma.user.findFirst({
      where: { role: "OWNER" },
    });

    if (existingOwner) {
      return Response.json(
        { error: "Owner allaqachon mavjud" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: parsed.data.username,
        password: hashedPassword,
        role: "OWNER",
      },
    });

    return Response.json({
      success: true,
      message: "Owner muvaffaqiyatli yaratildi",
      username: user.username,
    });
  } catch (error) {
    console.error("Bootstrap failed:", error);
    return Response.json({ error: "Bootstrap qo'lga olmadi" }, { status: 500 });
  }
}
