import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../models/prisma";
import { logActivity } from "../services/activityLogService";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Login ma'lumotlari noto'g'ri" });
  }

  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, env.jwtSecret, {
    expiresIn: "12h",
  });

  await logActivity(user.id, "auth", "LOGIN", "Foydalanuvchi tizimga kirdi");

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
    },
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, fullName: true, username: true, role: true },
  });
  return res.json(user);
}
