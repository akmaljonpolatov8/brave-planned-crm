import { Router } from "express";
import { createTeacher, deleteTeacher, listTeachers, updateTeacher } from "../controllers/teachersController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();
router.get("/", listTeachers);
router.post("/", roleCheck("OWNER", "MANAGER"), createTeacher);
router.put("/:id", roleCheck("OWNER", "MANAGER"), updateTeacher);
router.delete("/:id", roleCheck("OWNER"), deleteTeacher);
export default router;
