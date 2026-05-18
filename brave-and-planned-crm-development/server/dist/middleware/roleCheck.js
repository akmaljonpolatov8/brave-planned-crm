"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleCheck = void 0;
const roleCheck = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Sizda ushbu amal uchun ruxsat yo'q" });
    }
    return next();
};
exports.roleCheck = roleCheck;
