import { Router } from "express";
import { listDebtors, listSmsLogs, sendAllDebtorSms, sendDebtorSms } from "../controllers/debtorsController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();
router.get("/", listDebtors);
router.get("/sms-logs", listSmsLogs);
router.post("/send-all", roleCheck("OWNER", "MANAGER"), sendAllDebtorSms);
router.post("/:paymentId/send-sms", roleCheck("OWNER", "MANAGER"), sendDebtorSms);
export default router;
