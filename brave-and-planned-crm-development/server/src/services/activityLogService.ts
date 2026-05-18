import { prisma } from "../models/prisma";

export async function logActivity(userId: string, module: string, action: string, description: string, entityId?: string) {
  await prisma.activityLog.create({
    data: { userId, module, action, description, entityId },
  });
}
