"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const prisma_1 = require("../models/prisma");
async function logActivity(userId, module, action, description, entityId) {
    await prisma_1.prisma.activityLog.create({
        data: { userId, module, action, description, entityId },
    });
}
