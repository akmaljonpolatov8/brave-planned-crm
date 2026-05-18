"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const prisma_1 = require("../models/prisma");
const activityLogService_1 = require("../services/activityLogService");
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1),
});
async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Login ma'lumotlari noto'g'ri" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { username: parsed.data.username } });
    if (!user || !user.isActive) {
        return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
    }
    const valid = await bcryptjs_1.default.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, env_1.env.jwtSecret, {
        expiresIn: "12h",
    });
    await (0, activityLogService_1.logActivity)(user.id, "auth", "LOGIN", "Foydalanuvchi tizimga kirdi");
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
async function me(req, res) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, fullName: true, username: true, role: true },
    });
    return res.json(user);
}
