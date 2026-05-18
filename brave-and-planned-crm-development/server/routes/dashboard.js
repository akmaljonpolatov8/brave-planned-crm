const express = require("express");
const { all, get } = require("../db/database");

const router = express.Router();

function todayLabel() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

router.get("/", (req, res) => {
  const month = currentMonth();
  const today = todayLabel();
  const students = get("SELECT COUNT(*) AS count FROM students WHERE status = 'active'")?.count || 0;
  const groups = get("SELECT COUNT(*) AS count FROM groups WHERE is_active = 1")?.count || 0;
  const teachers = get("SELECT COUNT(*) AS count FROM teachers WHERE is_active = 1")?.count || 0;
  const debtors = get("SELECT COUNT(*) AS count FROM payments WHERE month = ? AND paid < amount", [month])?.count || 0;
  const revenue = get("SELECT COALESCE(SUM(paid), 0) AS sum FROM payments WHERE month = ?", [month])?.sum || 0;
  const studentsDelta = get(
    "SELECT COUNT(*) AS count FROM students WHERE substr(created_at, 1, 7) = ?",
    [month],
  )?.count || 0;

  const lastPayments = all(
    `
      SELECT
        p.id,
        s.full_name,
        g.name AS group_name,
        p.amount,
        p.paid,
        CASE
          WHEN p.paid >= p.amount THEN 'paid'
          WHEN p.paid > 0 THEN 'pending'
          ELSE 'unpaid'
        END AS status
      FROM payments p
      JOIN students s ON s.id = p.student_id
      JOIN groups g ON g.id = p.group_id
      ORDER BY COALESCE(p.paid_at, p.created_at) DESC
      LIMIT 10
    `,
  );

  const groupStatus = all(
    `
      SELECT
        g.id,
        g.name,
        COUNT(gs.student_id) AS total,
        SUM(CASE WHEN gs.is_active = 1 THEN 1 ELSE 0 END) AS present_today
      FROM groups g
      LEFT JOIN group_students gs ON gs.group_id = g.id
      WHERE g.is_active = 1
      GROUP BY g.id, g.name
      ORDER BY g.name
    `,
  );

  const todayAttendance = all(
    `
      SELECT
        g.id,
        g.name,
        g.start_time,
        COUNT(a.id) AS marked_count,
        CASE WHEN COUNT(a.id) > 0 THEN 'Belgilandi' ELSE 'Kutilmoqda' END AS status
      FROM groups g
      LEFT JOIN attendance a ON a.group_id = g.id AND a.date = ?
      WHERE g.is_active = 1
      GROUP BY g.id, g.name, g.start_time
      ORDER BY g.start_time
    `,
    [today],
  ).map((item) => ({
    id: item.id,
    name: item.name,
    time: item.start_time,
    marked: item.marked_count > 0,
    status: item.status,
  }));

  return res.json({
    topStats: {
      students,
      groups,
      teachers,
      revenue: req.user.role === "owner" ? revenue : null,
      debtors,
      studentsDelta,
    },
    lastPayments,
    groupStatus,
    todayAttendance,
  });
});

module.exports = router;
