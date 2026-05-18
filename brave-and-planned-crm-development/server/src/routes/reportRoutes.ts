import { Router } from "express";
import { getWeeklyReport } from "../controllers/reportsController";

const router = Router();
router.get("/weekly", getWeeklyReport);
export default router;
