"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Avtorizatsiya talab qilinadi" });
    }
    try {
        const token = authHeader.split(" ")[1];
        req.user = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        return next();
    }
    catch {
        return res.status(401).json({ message: "Token yaroqsiz yoki muddati tugagan" });
    }
}
