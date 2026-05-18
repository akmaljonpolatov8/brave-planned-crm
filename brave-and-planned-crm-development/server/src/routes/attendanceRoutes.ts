import { Router } from "express";
import { getAttendance, saveAttendance, weeklyAttendanceReport } from "../controllers/attendanceController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();
router.get("/", getAttendance);
router.post("/", roleCheck("OWNER", "MANAGER"), saveAttendance);
router.get("/weekly", weeklyAttendanceReport);
export default router;
