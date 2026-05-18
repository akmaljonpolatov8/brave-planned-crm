const express = require("express");
const multer = require("multer");
const { previewImport, saveImport } = require("../services/excelImport");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();
const upload = multer();

router.post("/excel/preview", roleCheck("owner", "manager"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Fayl topilmadi" });
  res.json(previewImport(req.file.buffer));
});

router.post("/excel", roleCheck("owner", "manager"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Fayl topilmadi" });
  res.json(saveImport(req.file.buffer));
});

module.exports = router;
