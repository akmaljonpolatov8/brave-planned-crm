import type { User } from "../context/AuthContext";

export const isOwner = (user: User | null) => user?.role === "owner";
export const canManage = (user: User | null) =>
  user?.role === "owner" || user?.role === "manager";
