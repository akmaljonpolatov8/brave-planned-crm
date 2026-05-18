const express = require("express");
const { db } = require("../db/database");

const router = express.Router();

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

router.get("/weekly", (req, res) => {
  const { from, to } = req.query.from && req.query.to ? req.query : getWeekBounds();
  const groups = db.prepare("SELECT * FROM groups ORDER BY name").all();

  const report = groups.map((group) => {
    const totalStudents = db.prepare("SELECT COUNT(*) AS count FROM students WHERE group_id = ?").get(group.id).count;
    const present = db.prepare(`
      SELECT COUNT(*) AS count FROM attendance
      WHERE group_id = ? AND date BETWEEN ? AND ? AND status = 'present'
    `).get(group.id, from, to).count;
    const absent = db.prepare(`
      SELECT COUNT(*) AS count FROM attendance
      WHERE group_id = ? AND date BETWEEN ? AND ? AND status = 'absent'
    `).get(group.id, from, to).count;
    const totalMarks = present + absent;
    return {
      group_id: group.id,
      group_name: group.name,
      total_students: totalStudents,
      present_count: present,
      absent_count: absent,
      attendance_rate: totalMarks ? Math.round((present / totalMarks) * 100) : 0,
    };
  });

  res.json({ from, to, report });
});

module.exports = router;
