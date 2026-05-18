require("dotenv").config();
require("./db/init");

const app = require("./app");
const { startScheduler } = require("./services/scheduler");

const port = Number(process.env.PORT || 5000);

startScheduler();

app.listen(port, () => {
  console.log(`Brave Planet CRM server running on http://localhost:${port}`);
});
