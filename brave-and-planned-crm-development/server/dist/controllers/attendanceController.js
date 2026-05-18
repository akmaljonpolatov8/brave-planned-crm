"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendance = getAttendance;
exports.saveAttendance = saveAttendance;
exports.weeklyAttendanceReport = weeklyAttendanceReport;
const zod_1 = require("zod");
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const dates_1 = require("../utils/dates");
const attendanceRowSchema = zod_1.z.object({
    studentId: zod_1.z.string(),
    status: zod_1.z.enum(["PRESENT", "ABSENT"]),
    note: zod_1.z.string().optional(),
});
async function getAttendance(req, res) {
    const groupId = String(req.query.groupId);
    const date = String(req.query.date);
    const records = await prisma_1.prisma.attendance.findMany({
        where: { groupId, date: new Date(date) },
    });
    return res.json(records);
}
async function saveAttendance(req, res) {
    const schema = zod_1.z.object({
        groupId: zod_1.z.string(),
        date: zod_1.z.string(),
        rows: zod_1.z.array(attendanceRowSchema),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Davomat ma'lumoti noto'g'ri" });
    for (const row of parsed.data.rows) {
        await prisma_1.prisma.attendance.upsert({
            where: {
                groupId_studentId_date: {
                    groupId: parsed.data.groupId,
                    studentId: row.studentId,
                    date: new Date(parsed.data.date),
                },
            },
            update: { status: row.status, note: row.note },
            create: {
                groupId: parsed.data.groupId,
                studentId: row.studentId,
                date: new Date(parsed.data.date),
                status: row.status,
                note: row.note,
            },
        });
    }
    await (0, activityLogService_1.logActivity)(req.user.id, "attendance", "SAVE", "Davomat saqlandi", parsed.data.groupId);
    return res.json({ success: true });
}
async function weeklyAttendanceReport(req, res) {
    const { from, to } = (0, dates_1.weekRange)(req.query.from ? String(req.query.from) : undefined, req.query.to ? String(req.query.to) : undefined);
    const groups = await prisma_1.prisma.group.findMany({
        include: {
            attendance: {
                where: { date: { gte: from, lte: to } },
            },
        },
        orderBy: { name: "asc" },
    });
    const report = groups.map((group) => {
        const present = group.attendance.filter((item) => item.status === "PRESENT").length;
        const absent = group.attendance.filter((item) => item.status === "ABSENT").length;
        const total = present + absent;
        return {
            groupId: group.id,
            groupName: group.name,
            present,
            absent,
            attendanceRate: total ? Math.round((present / total) * 100) : 0,
        };
    });
    return res.json({ from, to, report });
}
