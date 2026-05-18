import { NextFunction, Request, Response } from "express";

export const roleCheck =
  (...roles: Array<"OWNER" | "MANAGER">) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Sizda ushbu amal uchun ruxsat yo'q" });
    }
    return next();
  };
