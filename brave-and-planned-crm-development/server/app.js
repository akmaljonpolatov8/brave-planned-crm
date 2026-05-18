const express = require("express");
const cors = require("cors");
const path = require("path");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const attendanceRoutes = require("./routes/attendance");
const groupsRoutes = require("./routes/groups");
const studentsRoutes = require("./routes/students");
const teachersRoutes = require("./routes/teachers");
const paymentsRoutes = require("./routes/payments");
const debtorsRoutes = require("./routes/debtors");
const smsRoutes = require("./routes/sms");
const reportsRoutes = require("./routes/reports");
const importRoutes = require("./routes/import");
const searchRoutes = require("./routes/search");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", auth, dashboardRoutes);
app.use("/api/attendance", auth, attendanceRoutes);
app.use("/api/groups", auth, groupsRoutes);
app.use("/api/students", auth, studentsRoutes);
app.use("/api/teachers", auth, teachersRoutes);
app.use("/api/payments", auth, paymentsRoutes);
app.use("/api/debtors", auth, debtorsRoutes);
app.use("/api/sms", auth, smsRoutes);
app.use("/api/reports", auth, reportsRoutes);
app.use("/api/import", auth, importRoutes);
app.use("/api/search", auth, searchRoutes);

const clientDist = path.join(process.cwd(), "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  return res.sendFile(path.join(clientDist, "index.html"));
});

module.exports = app;
