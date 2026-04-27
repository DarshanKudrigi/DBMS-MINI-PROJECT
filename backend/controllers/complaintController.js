import pool from "../config/db.js";

function normalizeStatus(status) {
  if (!status) {
    return "pending";
  }

  const value = String(status).toLowerCase().replace(/\s+/g, "_");

  if (value === "in_progress") {
    return "in_progress";
  }

  if (value === "resolved") {
    return "resolved";
  }

  if (value === "rejected") {
    return "rejected";
  }

  return "pending";
}

export async function createComplaint(req, res) {
  const { title, description } = req.body;
  const studentId = String(req.user.id);

  if (!title || !description) {
    return res.status(400).json({ message: "title and description are required" });
  }

  try {
    const [students] = await pool.execute("SELECT dept_id FROM student WHERE student_id = ?", [studentId]);

    if (students.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [result] = await pool.execute(
      "INSERT INTO complaint (title, description, category, student_id, dept_id, handled_by) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, "Others", studentId, students[0].dept_id, null]
    );

    return res.status(201).json({
      message: "Complaint submitted",
      complaint: { id: result.insertId, student_id: studentId, title, description, status: "pending" }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit complaint", error: error.message });
  }
}

export async function getMyComplaints(req, res) {
  const studentId = String(req.user.id);

  try {
    const [rows] = await pool.execute(
      `SELECT
        c.complaint_id AS id,
        c.student_id,
        c.title,
        c.description,
        COALESCE(
          LOWER(REPLACE(cs.status, ' ', '_')),
          'pending'
        ) AS status,
        c.submitted_at AS created_at
      FROM complaint c
      LEFT JOIN (
        SELECT complaint_id, status
        FROM complaint_status
        WHERE status_id IN (
          SELECT MAX(status_id)
          FROM complaint_status
          GROUP BY complaint_id
        )
      ) cs ON cs.complaint_id = c.complaint_id
      WHERE c.student_id = ?
      ORDER BY c.complaint_id DESC`,
      [studentId]
    );

    return res.json({ data: rows.map((row) => ({ ...row, status: normalizeStatus(row.status) })) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
}
