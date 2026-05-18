import { z } from "zod";

export const studentSchema = z.object({
  firstName: z.string().min(1, "Ism kiritilishi shart"),
  lastName: z.string().min(1, "Familiya kiritilishi shart"),
  phone: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).default("ACTIVE"),
});

export const teacherSchema = z.object({
  fullName: z.string().min(1, "To'liq ism kiritilishi shart"),
  phone: z.string().optional().nullable(),
  username: z
    .string()
    .min(3, "Username kamida 3 ta belgidan iborat bo'lishi kerak"),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  isActive: z.boolean().default(true),
});

export const groupSchema = z.object({
  name: z.string().min(1, "Guruh nomi kiritilishi shart"),
  subject: z.string().default("English"),
  scheduleDays: z.array(z.string()).min(1, "Kamida bir kun tanlang"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Noto'g'ri vaqt formati"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Noto'g'ri vaqt formati"),
  monthlyFee: z.number().min(0, "Summa 0 dan katta bo'lishi kerak"),
  capacity: z.number().min(1, "Sig'im kamida 1 bo'lishi kerak").default(15),
  teacherId: z.string().cuid("Noto'g'ri o'qituvchi tanlangan"),
  isActive: z.boolean().default(true),
});

export const paymentSchema = z.object({
  studentId: z.string().cuid(),
  groupId: z.string().cuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Oy formati: YYYY-MM"),
  amount: z.number().min(0),
  status: z.enum(["PAID", "UNPAID"]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username kiritilishi shart"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

export const bootstrapSchema = z
  .object({
    username: z.string().min(3),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });

export const attendanceSchema = z.object({
  groupId: z.string().cuid(),
  date: z.string().datetime(),
  rows: z.record(z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"])),
});

export const smsSchema = z.object({
  studentIds: z.array(z.string().cuid()).min(1),
  month: z.string(),
  message: z.string().optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type SmsInput = z.infer<typeof smsSchema>;
