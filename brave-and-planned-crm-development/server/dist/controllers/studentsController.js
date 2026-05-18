"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudents = listStudents;
exports.createStudent = createStudent;
exports.updateStudent = updateStudent;
exports.deleteStudent = deleteStudent;
exports.transferStudent = transferStudent;
exports.studentPaymentHistory = studentPaymentHistory;
const zod_1 = require("zod");
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const dates_1 = require("../utils/dates");
const proration_1 = require("../utils/proration");
const studentSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    parentPhone: zod_1.z.string().min(1),
    birthDate: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(["ACTIVE", "DEBT", "INACTIVE"]),
    groupId: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
async function listStudents(req, res) {
    const search = String(req.query.search || "");
    const students = await prisma_1.prisma.student.findMany({
        where: search
            ? {
                OR: [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                ],
            }
            : undefined,
        include: {
            groupLinks: {
                where: { isActive: true },
                include: { group: true },
            },
            payments: { orderBy: { createdAt: "desc" }, take: 6 },
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return res.json(students);
}
async function createStudent(req, res) {
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
    const student = await prisma_1.prisma.student.create({
        data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            phone: parsed.data.phone,
            parentPhone: parsed.data.parentPhone,
            birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
            status: parsed.data.status,
            notes: parsed.data.notes || null,
            groupLinks: parsed.data.groupId
                ? {
                    create: {
                        groupId: parsed.data.groupId,
                    },
                }
                : undefined,
        },
        include: {
            groupLinks: { include: { group: true } },
        },
    });
    if (parsed.data.groupId) {
        const group = await prisma_1.prisma.group.findUniqueOrThrow({ where: { id: parsed.data.groupId } });
        await prisma_1.prisma.payment.create({
            data: {
                studentId: student.id,
                groupId: group.id,
                month: (0, dates_1.monthKey)(new Date()),
                amountDue: group.monthlyFee,
                dueDate: (0, dates_1.dueDateForMonth)((0, dates_1.monthKey)(new Date())),
                status: "UNPAID",
            },
        });
    }
    await (0, activityLogService_1.logActivity)(req.user.id, "students", "CREATE", "Yangi o'quvchi qo'shildi", student.id);
    return res.status(201).json(student);
}
async function updateStudent(req, res) {
    const id = String(req.params.id);
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
    const student = await prisma_1.prisma.student.update({
        where: { id },
        data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            phone: parsed.data.phone,
            parentPhone: parsed.data.parentPhone,
            birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
            status: parsed.data.status,
            notes: parsed.data.notes || null,
        },
    });
    await (0, activityLogService_1.logActivity)(req.user.id, "students", "UPDATE", "O'quvchi ma'lumoti yangilandi", student.id);
    return res.json(student);
}
async function deleteStudent(req, res) {
    const id = String(req.params.id);
    await prisma_1.prisma.student.delete({ where: { id } });
    await (0, activityLogService_1.logActivity)(req.user.id, "students", "DELETE", "O'quvchi o'chirildi", id);
    return res.json({ success: true });
}
async function transferStudent(req, res) {
    const id = String(req.params.id);
    const schema = zod_1.z.object({
        toGroupId: zod_1.z.string().min(1),
        transferDate: zod_1.z.string().min(1),
        note: zod_1.z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Transfer ma'lumotlari noto'g'ri" });
    const activeLink = await prisma_1.prisma.groupStudent.findFirst({
        where: { studentId: id, isActive: true },
    });
    if (!activeLink)
        return res.status(404).json({ message: "Talaba uchun faol guruh topilmadi" });
    const newGroup = await prisma_1.prisma.group.findUniqueOrThrow({ where: { id: parsed.data.toGroupId } });
    const effectiveDate = new Date(parsed.data.transferDate);
    const proratedAmount = (0, proration_1.calculateProratedAmount)(newGroup.monthlyFee, effectiveDate);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.groupStudent.update({
            where: { id: activeLink.id },
            data: { isActive: false, leftAt: effectiveDate },
        }),
        prisma_1.prisma.groupStudent.create({
            data: {
                studentId: id,
                groupId: parsed.data.toGroupId,
                joinedAt: effectiveDate,
            },
        }),
        prisma_1.prisma.transfer.create({
            data: {
                studentId: id,
                fromGroupId: activeLink.groupId,
                toGroupId: parsed.data.toGroupId,
                transferDate: effectiveDate,
                proratedAmount,
                note: parsed.data.note,
            },
        }),
        prisma_1.prisma.payment.upsert({
            where: {
                studentId_groupId_month: {
                    studentId: id,
                    groupId: parsed.data.toGroupId,
                    month: (0, dates_1.monthKey)(effectiveDate),
                },
            },
            update: { amountDue: proratedAmount, dueDate: effectiveDate, status: "UNPAID" },
            create: {
                studentId: id,
                groupId: parsed.data.toGroupId,
                month: (0, dates_1.monthKey)(effectiveDate),
                amountDue: proratedAmount,
                dueDate: effectiveDate,
                status: "UNPAID",
            },
        }),
    ]);
    await (0, activityLogService_1.logActivity)(req.user.id, "students", "TRANSFER", "O'quvchi boshqa guruhga o'tkazildi", id);
    return res.json({ success: true, proratedAmount });
}
async function studentPaymentHistory(req, res) {
    const id = String(req.params.id);
    const payments = await prisma_1.prisma.payment.findMany({
        where: { studentId: id },
        include: { group: true },
        orderBy: [{ month: "desc" }],
    });
    const transfers = await prisma_1.prisma.transfer.findMany({
        where: { studentId: id },
        include: { fromGroup: true, toGroup: true },
        orderBy: { transferDate: "desc" },
    });
    return res.json({ payments, transfers });
}
