require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const studentsRoutes = require("./routes/students");
const teachersRoutes = require("./routes/teachers");
const groupsRoutes = require("./routes/groups");
const attendanceRoutes = require("./routes/attendance");
const paymentsRoutes = require("./routes/payments");
const debtorsRoutes = require("./routes/debtors");
const smsRoutes = require("./routes/sms");
const importRoutes = require("./routes/import");
const { auth } = require("./middleware/auth");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", auth, dashboardRoutes);
app.use("/api/students", auth, studentsRoutes);
app.use("/api/teachers", auth, teachersRoutes);
app.use("/api/groups", auth, groupsRoutes);
app.use("/api/attendance", auth, attendanceRoutes);
app.use("/api/payments", auth, paymentsRoutes);
app.use("/api/debtors", auth, debtorsRoutes);
app.use("/api/sms", auth, smsRoutes);
app.use("/api/import", auth, importRoutes);

const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  return res.sendFile(path.join(clientDist, "index.html"));
});

module.exports = app;
