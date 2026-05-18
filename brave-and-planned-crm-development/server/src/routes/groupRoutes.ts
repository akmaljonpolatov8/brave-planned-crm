import { Router } from "express";
import { createGroup, deleteGroup, getRoster, listGroups, updateGroup } from "../controllers/groupsController";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();
router.get("/", listGroups);
router.get("/:id/roster", getRoster);
router.post("/", roleCheck("OWNER", "MANAGER"), createGroup);
router.put("/:id", roleCheck("OWNER", "MANAGER"), updateGroup);
router.delete("/:id", roleCheck("OWNER"), deleteGroup);
export default router;
