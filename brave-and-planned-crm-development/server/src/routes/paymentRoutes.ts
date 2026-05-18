import { Router } from "express";
import { listPayments, markAsPaid, updatePayment } from "../controllers/paymentsController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();
router.get("/", listPayments);
router.patch("/:id/pay", roleCheck("OWNER", "MANAGER"), markAsPaid);
router.put("/:id", roleCheck("OWNER", "MANAGER"), updatePayment);
export default router;
