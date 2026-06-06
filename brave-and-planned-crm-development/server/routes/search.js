import express from "express";
import { db } from "../db/database.js";

const router = express.Router();

router.get("/", (req, res) => {
  const q = (req.query.q || "").trim();
  const rows = db.prepare(`
    SELECT s.id, s.full_name, s.telefon, s.ota_phone, s.ona_phone, g.name AS group_name, p.paid
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    LEFT JOIN payments p ON p.student_id = s.id AND p.month = ?
    WHERE lower(s.full_name) LIKE lower(?)
    ORDER BY s.full_name
  `).all(new Date().toISOString().slice(0, 7), `%${q}%`);
  res.json(rows);
});

export default router;
