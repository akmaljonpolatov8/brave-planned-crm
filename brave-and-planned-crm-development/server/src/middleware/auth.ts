import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Avtorizatsiya talab qilinadi" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, env.jwtSecret) as Request["user"];
    return next();
  } catch {
    return res.status(401).json({ message: "Token yaroqsiz yoki muddati tugagan" });
  }
}
