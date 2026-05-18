"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const paymentScheduler_1 = require("./services/paymentScheduler");
const paymentService_1 = require("./services/paymentService");
async function bootstrap() {
    await (0, paymentService_1.ensureCurrentMonthPayments)();
    await (0, paymentService_1.syncStudentDebtStatuses)();
    (0, paymentScheduler_1.startPaymentScheduler)();
    app_1.default.listen(env_1.env.port, () => {
        console.log(`CRM server running on http://localhost:${env_1.env.port}`);
    });
}
bootstrap().catch((error) => {
    console.error("Server start failed", error);
    process.exit(1);
});
