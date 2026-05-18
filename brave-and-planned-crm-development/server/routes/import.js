const express = require("express");
const roleCheck = require("../middleware/roleCheck");
const { importWorkbookBuffer } = require("../services/excelImport");

const router = express.Router();

router.post("/excel", roleCheck("owner"), (req, res) => {
  const { fileName = "", contentBase64 = "" } = req.body || {};

  if (!contentBase64) {
    return res.status(400).json({ message: "Excel fayl yuborilmadi" });
  }

  try {
    const summary = importWorkbookBuffer(Buffer.from(contentBase64, "base64"));
    return res.json({
      ok: true,
      fileName,
      summary,
      message: "Excel ma'lumotlari import qilindi",
    });
  } catch (error) {
    console.error("Excel import failed", error);
    return res.status(500).json({ message: "Excel importda xatolik yuz berdi" });
  }
});

module.exports = router;
