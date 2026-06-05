import app from './app.js';
import { initializeDatabase } from './db/database.js';
import { startScheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Start scheduler
startScheduler();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
