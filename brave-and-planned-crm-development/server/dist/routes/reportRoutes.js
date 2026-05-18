"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportsController_1 = require("../controllers/reportsController");
const router = (0, express_1.Router)();
router.get("/weekly", reportsController_1.getWeeklyReport);
exports.default = router;
