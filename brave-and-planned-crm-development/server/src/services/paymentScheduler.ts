import cron from "node-cron";
import { ensureCurrentMonthPayments, sendMonthlyDebtNotifications, syncStudentDebtStatuses } from "./paymentService";

export function startPaymentScheduler() {
  cron.schedule("1 0 * * *", async () => {
    await ensureCurrentMonthPayments();
    await syncStudentDebtStatuses();

    const today = new Date();
    if (today.getDate() === 2) {
      await sendMonthlyDebtNotifications();
    }
  });
}
