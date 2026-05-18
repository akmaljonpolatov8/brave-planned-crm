import app from "./app";
import { env } from "./config/env";
import { startPaymentScheduler } from "./services/paymentScheduler";
import { ensureCurrentMonthPayments, syncStudentDebtStatuses } from "./services/paymentService";

async function bootstrap() {
  await ensureCurrentMonthPayments();
  await syncStudentDebtStatuses();
  startPaymentScheduler();

  app.listen(env.port, () => {
    console.log(`CRM server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Server start failed", error);
  process.exit(1);
});
