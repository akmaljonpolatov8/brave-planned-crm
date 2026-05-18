const fs = require("fs");
const path = require("path");
const { db } = require("./database");
const { seedDatabase } = require("./seed");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

const smsLogColumns = db.prepare("PRAGMA table_info(sms_logs)").all();
if (!smsLogColumns.some((column) => column.name === "group_id")) {
  db.exec("ALTER TABLE sms_logs ADD COLUMN group_id INTEGER REFERENCES groups(id)");
}

db.exec(`
  UPDATE sms_logs
  SET group_id = (
    SELECT p.group_id
    FROM payments p
    WHERE p.student_id = sms_logs.student_id
      AND p.month = sms_logs.month
    ORDER BY p.id DESC
    LIMIT 1
  )
  WHERE group_id IS NULL
`);

const userCountRow = db.prepare("SELECT COUNT(*) AS count FROM users").get();
if ((userCountRow?.count || 0) === 0) {
  seedDatabase();
}

console.log("Database initialized");
