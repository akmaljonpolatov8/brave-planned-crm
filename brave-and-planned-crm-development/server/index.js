require("dotenv").config();
const app = require("./app");
const { initializeDatabase } = require("./db/database");
const { startScheduler } = require("./services/scheduler");

initializeDatabase();
startScheduler();

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
