"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPaymentScheduler = startPaymentScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const paymentService_1 = require("./paymentService");
function startPaymentScheduler() {
    node_cron_1.default.schedule("1 0 * * *", async () => {
        await (0, paymentService_1.ensureCurrentMonthPayments)();
        await (0, paymentService_1.syncStudentDebtStatuses)();
        const today = new Date();
        if (today.getDate() === 2) {
            await (0, paymentService_1.sendMonthlyDebtNotifications)();
        }
    });
}
