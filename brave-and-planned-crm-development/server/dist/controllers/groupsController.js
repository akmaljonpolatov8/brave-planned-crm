"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGroups = listGroups;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
exports.getRoster = getRoster;
const zod_1 = require("zod");
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const groupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    teacherId: zod_1.z.string().min(1),
    schedule: zod_1.z.string().min(1),
    monthlyFee: zod_1.z.number().int().min(0),
    startDate: zod_1.z.string().min(1),
    isActive: zod_1.z.boolean().default(true),
});
async function listGroups(_req, res) {
    const groups = await prisma_1.prisma.group.findMany({
        include: {
            teacher: true,
            students: {
                where: { isActive: true },
                include: { student: true },
            },
        },
        orderBy: { name: "asc" },
    });
    return res.json(groups);
}
async function createGroup(req, res) {
    const parsed = groupSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
    const group = await prisma_1.prisma.group.create({
        data: {
            ...parsed.data,
            startDate: new Date(parsed.data.startDate),
        },
    });
    await (0, activityLogService_1.logActivity)(req.user.id, "groups", "CREATE", "Yangi guruh yaratildi", group.id);
    return res.status(201).json(group);
}
async function updateGroup(req, res) {
    const id = String(req.params.id);
    const parsed = groupSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri" });
    const group = await prisma_1.prisma.group.update({
        where: { id },
        data: {
            ...parsed.data,
            startDate: new Date(parsed.data.startDate),
        },
    });
    await (0, activityLogService_1.logActivity)(req.user.id, "groups", "UPDATE", "Guruh yangilandi", group.id);
    return res.json(group);
}
async function deleteGroup(req, res) {
    const id = String(req.params.id);
    await prisma_1.prisma.group.delete({ where: { id } });
    await (0, activityLogService_1.logActivity)(req.user.id, "groups", "DELETE", "Guruh o'chirildi", id);
    return res.json({ success: true });
}
async function getRoster(req, res) {
    const id = String(req.params.id);
    const roster = await prisma_1.prisma.groupStudent.findMany({
        where: { groupId: id, isActive: true },
        include: { student: true },
        orderBy: { joinedAt: "asc" },
    });
    return res.json(roster);
}
