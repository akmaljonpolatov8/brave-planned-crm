require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { importWorkbookBuffer } = require("../services/excelImport");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm run import:excel -- <path-to-xls>");
  process.exit(1);
}

try {
  const absolutePath = path.resolve(filePath);
  const summary = importWorkbookBuffer(fs.readFileSync(absolutePath));
  console.log(
    JSON.stringify(
      {
        ok: true,
        file: absolutePath,
        ...summary,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("Excel import failed");
  console.error(error);
  process.exit(1);
}
