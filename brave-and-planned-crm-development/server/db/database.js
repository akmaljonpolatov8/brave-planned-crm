import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "../../crm.db");

let _db;

export function getDatabase() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("foreign_keys = ON");
  }
  return _db;
}

export function initializeDatabase() {
  const database = getDatabase();

  // Read schema
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

  // Execute schema
  database.exec(schema);

  const groupColumns = database.prepare("PRAGMA table_info(groups)").all();
  const hasCapacity = groupColumns.some((column) => column.name === "capacity");
  if (!hasCapacity) {
    database.exec("ALTER TABLE groups ADD COLUMN capacity INTEGER DEFAULT 20");
  }

  console.log("✅ Database initialized");
}

export function closeDatabase() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

// Lazy proxy — allows `import { db } from '../db/database.js'`
export const db = new Proxy({}, {
  get(_target, prop) {
    const database = getDatabase();
    const value = database[prop];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  }
});

export function transaction(fn) {
  const database = getDatabase();
  const trx = database.transaction(fn);
  return trx();
}
