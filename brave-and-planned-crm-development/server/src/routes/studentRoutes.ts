import { Router } from "express";
import {
  createStudent,
  deleteStudent,
  listStudents,
  studentPaymentHistory,
  transferStudent,
  updateStudent,
} from "../controllers/studentsController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();

router.get("/", listStudents);
router.post("/", roleCheck("OWNER", "MANAGER"), createStudent);
router.put("/:id", roleCheck("OWNER", "MANAGER"), updateStudent);
router.delete("/:id", roleCheck("OWNER"), deleteStudent);
router.get("/:id/history", studentPaymentHistory);
router.post("/:id/transfer", roleCheck("OWNER", "MANAGER"), transferStudent);

export default router;
