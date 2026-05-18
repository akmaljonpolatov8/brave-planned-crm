import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./routes/authRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import debtorRoutes from "./routes/debtorRoutes";
import groupRoutes from "./routes/groupRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import reportRoutes from "./routes/reportRoutes";
import searchRoutes from "./routes/searchRoutes";
import smsRoutes from "./routes/smsRoutes";
import studentRoutes from "./routes/studentRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import { env } from "./config/env";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/students", authMiddleware, studentRoutes);
app.use("/api/teachers", authMiddleware, teacherRoutes);
app.use("/api/groups", authMiddleware, groupRoutes);
app.use("/api/attendance", authMiddleware, attendanceRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/debtors", authMiddleware, debtorRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/search", authMiddleware, searchRoutes);
app.use("/api/sms", authMiddleware, smsRoutes);

const clientDist = path.resolve(process.cwd(), "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  return res.sendFile(path.join(clientDist, "index.html"));
});

app.use(errorHandler);

export default app;
