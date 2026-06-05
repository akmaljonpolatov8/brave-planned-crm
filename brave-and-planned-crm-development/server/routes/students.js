import express from "express";
import { getDatabase } from "../db/database.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// Get all students
router.get("/", (req, res) => {
  const db = getDatabase();
  const students = db
    .prepare(
      `
    SELECT s.*, 
           GROUP_CONCAT(g.name) as groups
    FROM students s
    LEFT JOIN group_students gs ON s.id = gs.student_id AND gs.is_active = 1
    LEFT JOIN groups g ON gs.group_id = g.id
    GROUP BY s.id
    ORDER BY s.full_name
  `,
    )
    .all();
  res.json(students);
});

// Get student by ID
router.get("/:id", (req, res) => {
  const db = getDatabase();
  const student = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

// Create student
router.post("/", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, phone, parent_phone, parent_name, status, notes } =
    req.body;

  if (!full_name) {
    return res.status(400).json({ message: "Full name required" });
  }

  const db = getDatabase();
  const result = db
    .prepare(
      `
    INSERT INTO students (full_name, phone, parent_phone, parent_name, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      full_name,
      phone || null,
      parent_phone || null,
      parent_name || null,
      status || "active",
      notes || null,
    );

  res
    .status(201)
    .json({
      id: result.lastInsertRowid,
      full_name,
      phone,
      parent_phone,
      parent_name,
      status,
      notes,
    });
});

// Update student
router.put("/:id", roleCheck("owner", "manager"), (req, res) => {
  const { full_name, phone, parent_phone, parent_name, status, notes } =
    req.body;
  const db = getDatabase();

  const student = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.params.id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  db.prepare(
    `
    UPDATE students SET full_name = ?, phone = ?, parent_phone = ?, parent_name = ?, status = ?, notes = ?
    WHERE id = ?
  `,
  ).run(
    full_name || student.full_name,
    phone || student.phone,
    parent_phone || student.parent_phone,
    parent_name || student.parent_name,
    status || student.status,
    notes || student.notes,
    req.params.id,
  );

  res.json({
    id: req.params.id,
    full_name,
    phone,
    parent_phone,
    parent_name,
    status,
    notes,
  });
});

// Delete student
router.delete("/:id", roleCheck("owner"), (req, res) => {
  const db = getDatabase();
  const student = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ message: "Student deleted" });
});

// Transfer student to another group
router.post("/:id/transfer", roleCheck("owner", "manager"), (req, res) => {
  const {
    from_group_id,
    to_group_id,
    fromGroupId,
    toGroupId,
    studentId: bodyStudentId,
    note,
  } = req.body;
  const studentId = req.params.id;
  const db = getDatabase();

  const student = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Remove from old group
  const sourceGroupId = from_group_id || fromGroupId;
  const targetGroupId = to_group_id || toGroupId;

  if (!sourceGroupId || !targetGroupId) {
    return res
      .status(400)
      .json({ message: "from_group_id and to_group_id required" });
  }

  db.prepare(
    "UPDATE group_students SET is_active = 0, left_at = datetime('now') WHERE student_id = ? AND group_id = ?",
  ).run(bodyStudentId || studentId, sourceGroupId);

  // Add to new group
  db.prepare(
    "INSERT INTO group_students (group_id, student_id, is_active) VALUES (?, ?, 1)",
  ).run(targetGroupId, bodyStudentId || studentId);

  // Log transfer
  db.prepare(
    "INSERT INTO transfers (student_id, from_group_id, to_group_id, note, done_by) VALUES (?, ?, ?, ?, ?)",
  ).run(
    bodyStudentId || studentId,
    sourceGroupId,
    targetGroupId,
    note || null,
    req.user.id,
  );

  res.json({ message: "Student transferred" });
});

export default router;
