import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Login kiritilishi shart"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

export const bootstrapSchema = z.object({
  username: z.string().min(1, "Login kiritilishi shart"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

export const studentSchema = z.object({
  firstName: z.string().min(1, "Ism kiritilishi shart"),
  lastName: z.string().default(""),
  phone: z.string().optional().default(""),
  parentPhone: z.string().optional().default(""),
  parentName: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).default("ACTIVE"),
  groupIds: z.array(z.string()).optional().default([]),
});

export const teacherSchema = z.object({
  fullName: z.string().min(1, "To'liq ism kiritilishi shart"),
  phone: z.string().optional().default(""),
  username: z.string().min(3, "Login kamida 3 ta belgi"),
  password: z.string().min(6, "Parol kamida 6 ta belgi"),
  isActive: z.boolean().default(true),
});

export const teacherUpdateSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  newPassword: z.string().min(6).optional(),
});

export const groupSchema = z.object({
  name: z.string().min(1, "Guruh nomi kiritilishi shart"),
  subject: z.string().default("English"),
  scheduleDays: z.array(z.string()).min(1, "Kamida 1 kun tanlang"),
  startTime: z.string().min(1, "Boshlanish vaqti kiritilishi shart"),
  endTime: z.string().default(""),
  monthlyFee: z.number().min(0, "To'lov summasi musbat bo'lishi kerak"),
  capacity: z.number().min(1).default(20),
  teacherId: z.string().min(1, "O'qituvchi tanlanishi shart"),
  isActive: z.boolean().default(true),
});

export const transferSchema = z.object({
  studentId: z.string().min(1),
  fromGroupId: z.string().min(1),
  toGroupId: z.string().min(1),
});

export const attendanceSchema = z.object({
  groupId: z.string().min(1),
  date: z.string().min(1),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    }),
  ),
});

export const paymentSchema = z.object({
  studentId: z.string().min(1),
  groupId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
  amount: z.number().min(0),
  status: z.enum(["PAID", "UNPAID"]),
});
