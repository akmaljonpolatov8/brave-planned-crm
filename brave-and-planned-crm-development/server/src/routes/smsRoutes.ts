import { Router } from "express";
import { sendTestSms } from "../controllers/smsController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();
router.post("/test", roleCheck("OWNER"), sendTestSms);
export default router;
