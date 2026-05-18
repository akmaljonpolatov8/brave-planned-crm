import type { UserRole } from "../types";

export const canSeeRevenue = (role?: UserRole) => role === "owner";
export const canDelete = (role?: UserRole) => role === "owner";
export const canManage = (role?: UserRole) => role === "owner" || role === "manager";
