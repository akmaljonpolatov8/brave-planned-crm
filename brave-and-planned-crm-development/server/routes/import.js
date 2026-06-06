import express from "express";
import multer from "multer";
import { previewImport, saveImport } from "../services/excelImport.js";
import { roleCheck } from "../middleware/roleCheck.js";

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

export default router;
