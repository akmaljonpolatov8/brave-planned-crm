"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const smsController_1 = require("../controllers/smsController");
const roleCheck_1 = require("../middleware/roleCheck");
const router = (0, express_1.Router)();
router.post("/test", (0, roleCheck_1.roleCheck)("OWNER"), smsController_1.sendTestSms);
exports.default = router;
