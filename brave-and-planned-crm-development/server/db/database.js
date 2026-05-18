const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "brave_planet.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

function transaction(fn) {
  return db.transaction(fn)();
}

module.exports = {
  db,
  dbPath,
  initializeDatabase,
  transaction,
};
