"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTeachers = listTeachers;
exports.createTeacher = createTeacher;
exports.updateTeacher = updateTeacher;
exports.deleteTeacher = deleteTeacher;
const zod_1 = require("zod");
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const teacherSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    specialty: zod_1.z.string().optional().nullable(),
});
async function listTeachers(_req, res) {
    const teachers = await prisma_1.prisma.teacher.findMany({
        include: { groups: true },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return res.json(teachers);
}
async function createTeacher(req, res) {
    const parsed = teacherSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
    const teacher = await prisma_1.prisma.teacher.create({ data: parsed.data });
    await (0, activityLogService_1.logActivity)(req.user.id, "teachers", "CREATE", "Yangi o'qituvchi qo'shildi", teacher.id);
    return res.status(201).json(teacher);
}
async function updateTeacher(req, res) {
    const id = String(req.params.id);
    const parsed = teacherSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
    const teacher = await prisma_1.prisma.teacher.update({ where: { id }, data: parsed.data });
    await (0, activityLogService_1.logActivity)(req.user.id, "teachers", "UPDATE", "O'qituvchi ma'lumoti yangilandi", teacher.id);
    return res.json(teacher);
}
async function deleteTeacher(req, res) {
    const id = String(req.params.id);
    await prisma_1.prisma.teacher.delete({ where: { id } });
    await (0, activityLogService_1.logActivity)(req.user.id, "teachers", "DELETE", "O'qituvchi o'chirildi", id);
    return res.json({ success: true });
}
