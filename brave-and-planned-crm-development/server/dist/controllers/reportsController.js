"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyReport = getWeeklyReport;
const attendanceController_1 = require("./attendanceController");
async function getWeeklyReport(req, res) {
    return (0, attendanceController_1.weeklyAttendanceReport)(req, res);
}
