const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbDir = __dirname;
const dbPath = path.join(dbDir, "brave_planet.sqlite");

fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function run(sql, params = []) {
  return db.prepare(sql).run(params);
}

function get(sql, params = []) {
  return db.prepare(sql).get(params);
}

function all(sql, params = []) {
  return db.prepare(sql).all(params);
}

function transaction(fn) {
  return db.transaction(fn);
}

module.exports = {
  db,
  dbPath,
  run,
  get,
  all,
  transaction,
};
