const { initializeDatabase, dbPath } = require("./database");

initializeDatabase();
console.log(`Database initialized: ${dbPath}`);
