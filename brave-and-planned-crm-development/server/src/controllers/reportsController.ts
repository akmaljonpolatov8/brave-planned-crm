import { Request, Response } from "express";
import { weeklyAttendanceReport } from "./attendanceController";

export async function getWeeklyReport(req: Request, res: Response) {
  return weeklyAttendanceReport(req, res);
}
