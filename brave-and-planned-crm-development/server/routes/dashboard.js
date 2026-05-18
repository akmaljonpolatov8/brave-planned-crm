const express = require("express");
const { db } = require("../db/database");

const router = express.Router();

router.get("/", (req, res) => {
  const month = new Date().toISOString().slice(0, 7);
  const students = db
    .prepare("SELECT COUNT(*) AS count FROM students")
    .get().count;
  const groups = db.prepare("SELECT COUNT(*) AS count FROM groups").get().count;
  const teachers = db
    .prepare("SELECT COUNT(*) AS count FROM teachers")
    .get().count;
  const unpaid = db
    .prepare(
      "SELECT COUNT(*) AS count FROM payments WHERE month = ? AND paid = 0",
    )
    .get(month).count;
  const revenue =
    req.user.role === "owner"
      ? db
          .prepare(
            "SELECT COALESCE(SUM(amount), 0) AS sum FROM payments WHERE month = ? AND paid = 1",
          )
          .get(month).sum
      : null;

  const lastPayments = db
    .prepare(
      `
    SELECT s.full_name, g.name AS group_name, p.amount, p.paid
    FROM payments p
    JOIN students s ON s.id = p.student_id
    LEFT JOIN groups g ON g.id = p.group_id
    ORDER BY COALESCE(p.paid_at, p.month) DESC
    LIMIT 10
  `,
    )
    .all();

  const groupStatus = db
    .prepare(
      `
    SELECT g.id, g.name,
      COUNT(s.id) AS total,
      SUM(CASE WHEN a.status = 'present' AND a.date = date('now') THEN 1 ELSE 0 END) AS present_today
    FROM groups g
    LEFT JOIN students s ON s.group_id = g.id
    LEFT JOIN attendance a ON a.group_id = g.id AND a.student_id = s.id
    GROUP BY g.id
    ORDER BY g.name
    LIMIT 6
  `,
    )
    .all();

  const todayLessons = db
    .prepare(
      `
    SELECT id, name, schedule_time
    FROM groups
    ORDER BY schedule_time
    LIMIT 6
  `,
    )
    .all()
    .map((group) => {
      const marked =
        db
          .prepare(
            "SELECT COUNT(*) AS count FROM attendance WHERE group_id = ? AND date = date('now')",
          )
          .get(group.id).count > 0;
      return {
        name: group.name,
        time: group.schedule_time || "--:--",
        marked,
        status: marked ? "Belgilandi" : "Kutilmoqda",
      };
    });

  res.json({
    topStats: {
      students,
      groups,
      teachers,
      revenue,
      unpaid,
      studentsDelta: 8,
    },
    lastPayments,
    groupStatus,
    todayLessons,
  });
});

module.exports = router;
