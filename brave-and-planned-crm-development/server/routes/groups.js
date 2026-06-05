import express from "express";
import { getDatabase } from "../db/database.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

router.get("/", (req, res) => {
  const db = getDatabase();
  const groups = db
    .prepare(
      `
    SELECT 
      g.*,
      COUNT(gs.id) as student_count
    FROM groups g
    LEFT JOIN group_students gs ON g.id = gs.group_id AND gs.is_active = 1
    WHERE g.is_active = 1
    GROUP BY g.id
    ORDER BY g.name
  `,
    )
    .all();
  res.json(groups);
});

router.get("/:id", (req, res) => {
  const db = getDatabase();
  const group = db
    .prepare("SELECT * FROM groups WHERE id = ?")
    .get(req.params.id);

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }
  res.json(group);
});

router.get("/:id/students", (req, res) => {
  const db = getDatabase();
  const students = db
    .prepare(
      `
    SELECT s.* FROM students s
    JOIN group_students gs ON s.id = gs.student_id
    WHERE gs.group_id = ? AND gs.is_active = 1
    ORDER BY s.full_name
  `,
    )
    .all(req.params.id);
  res.json(students);
});

router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const {
    name,
    teacher_id,
    teacherId,
    schedule_days,
    scheduleDays,
    start_time,
    startTime,
    end_time,
    endTime,
    monthly_fee,
    monthlyFee,
    capacity,
    is_active,
    isActive,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Group name required" });
  }

  const db = getDatabase();
  const result = db
    .prepare(
      `
    INSERT INTO groups (name, teacher_id, schedule_days, start_time, end_time, monthly_fee, capacity, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      name,
      teacher_id ?? teacherId ?? null,
      schedule_days ?? scheduleDays ?? null,
      start_time ?? startTime ?? null,
      end_time ?? endTime ?? null,
      monthly_fee ?? monthlyFee ?? 0,
      capacity ?? 20,
      is_active ?? isActive ?? 1,
    );

  res.status(201).json({
    id: result.lastInsertRowid,
    name,
    teacher_id: teacher_id ?? teacherId ?? null,
    schedule_days: schedule_days ?? scheduleDays ?? null,
    start_time: start_time ?? startTime ?? null,
    end_time: end_time ?? endTime ?? null,
    monthly_fee: monthly_fee ?? monthlyFee ?? 0,
    capacity: capacity ?? 20,
    is_active: is_active ?? isActive ?? 1,
  });
});

router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const {
    name,
    teacher_id,
    teacherId,
    schedule_days,
    scheduleDays,
    start_time,
    startTime,
    end_time,
    endTime,
    monthly_fee,
    monthlyFee,
    capacity,
    is_active,
    isActive,
  } = req.body;
  const db = getDatabase();

  const group = db
    .prepare("SELECT * FROM groups WHERE id = ?")
    .get(req.params.id);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  db.prepare(
    `
    UPDATE groups 
    SET name = ?, teacher_id = ?, schedule_days = ?, start_time = ?, end_time = ?, monthly_fee = ?, capacity = ?, is_active = ?
    WHERE id = ?
  `,
  ).run(
    name || group.name,
    teacher_id !== undefined
      ? teacher_id
      : teacherId !== undefined
        ? teacherId
        : group.teacher_id,
    schedule_days !== undefined
      ? schedule_days
      : scheduleDays !== undefined
        ? scheduleDays
        : group.schedule_days,
    start_time !== undefined
      ? start_time
      : startTime !== undefined
        ? startTime
        : group.start_time,
    end_time !== undefined
      ? end_time
      : endTime !== undefined
        ? endTime
        : group.end_time,
    monthly_fee !== undefined
      ? monthly_fee
      : monthlyFee !== undefined
        ? monthlyFee
        : group.monthly_fee,
    capacity !== undefined ? capacity : (group.capacity ?? 20),
    is_active !== undefined
      ? is_active
      : isActive !== undefined
        ? isActive
        : (group.is_active ?? 1),
    req.params.id,
  );

  res.json({
    id: req.params.id,
    name,
    teacher_id: teacher_id ?? teacherId,
    schedule_days: schedule_days ?? scheduleDays,
    start_time: start_time ?? startTime,
    end_time: end_time ?? endTime,
    monthly_fee: monthly_fee ?? monthlyFee,
    capacity: capacity ?? group.capacity ?? 20,
    is_active: is_active ?? isActive ?? group.is_active ?? 1,
  });
});

router.delete("/:id", roleCheck("owner"), (req, res) => {
  const db = getDatabase();
  db.prepare("UPDATE groups SET is_active = 0 WHERE id = ?").run(req.params.id);
  res.json({ message: "Group deleted" });
});

router.post("/:id/students", roleCheck("owner", "manager"), (req, res) => {
  const { student_id } = req.body;
  const groupId = req.params.id;
  const db = getDatabase();

  const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  const student = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(student_id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  try {
    const result = db
      .prepare(
        "INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)",
      )
      .run(groupId, student_id);
    res
      .status(201)
      .json({ id: result.lastInsertRowid, group_id: groupId, student_id });
  } catch (err) {
    return res.status(400).json({ message: "Student already in group" });
  }
});

export default router;
