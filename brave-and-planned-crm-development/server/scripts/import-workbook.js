import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db, initializeDatabase } from "../db/database.js";
import { saveImport } from "../services/excelImport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultWorkbookPath =
  "c:\\Users\\Akmaljon\\OneDrive\\Рабочий стол\\brave exel\\Talabalar_CRM_1.xlsx";
const workbookPath = process.argv[2] || defaultWorkbookPath;

if (!fs.existsSync(workbookPath)) {
  console.error(`Workbook not found: ${workbookPath}`);
  process.exit(1);
}

initializeDatabase();

db.exec(`
  DELETE FROM sms_logs;
  DELETE FROM student_transfers;
  DELETE FROM refresh_tokens;
  DELETE FROM attendance;
  DELETE FROM payments;
  DELETE FROM students;
  DELETE FROM groups;
  DELETE FROM teachers;
`);

const buffer = fs.readFileSync(workbookPath);
const result = saveImport(buffer);

console.log(`Imported workbook: ${path.basename(workbookPath)}`);
console.log(JSON.stringify(result, null, 2));
