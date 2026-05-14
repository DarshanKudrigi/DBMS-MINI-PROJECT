import pool from "../config/db.js";

function toDisplayStatus(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "in_progress") {
    return "In Progress";
  }

  if (normalized === "resolved") {
    return "Resolved";
  }

  if (normalized === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

function fromDatabaseStatus(status) {
  return String(status || "pending").toLowerCase().replace(/\s+/g, "_");
}

export async function getAllComplaints(req, res) {
  try {
    const adminDepartmentId = Number(req.user.department_id);

    if (!Number.isFinite(adminDepartmentId)) {
      return res.status(400).json({ message: "Admin department not found" });
    }

    const [rows] = await pool.execute(
      `SELECT
        c.complaint_id AS id,
        c.title,
        c.description,
        c.department_id,
        d.dept_name,
        c.issue_type,
        COALESCE(
          LOWER(REPLACE(cs.status, ' ', '_')),
          'pending'
        ) AS status,
        c.submitted_at AS created_at,
        s.student_id AS student_id,
        s.name AS student_name,
        s.email AS student_email
      FROM complaint c
      JOIN student s ON c.student_id = s.student_id
      JOIN department d ON c.department_id = d.department_id
      LEFT JOIN (
        SELECT complaint_id, status
        FROM complaint_status
        WHERE status_id IN (
          SELECT MAX(status_id)
          FROM complaint_status
          GROUP BY complaint_id
        )
      ) cs ON cs.complaint_id = c.complaint_id
      WHERE c.department_id = ?
      ORDER BY c.complaint_id DESC`,
      [adminDepartmentId]
    );

    return res.json({ data: rows.map((row) => ({ ...row, status: fromDatabaseStatus(row.status) })) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
}

export async function updateComplaintStatus(req, res) {
  const complaintId = Number(req.params.id);
  const { status, remarks } = req.body;
  const allowed = ["pending", "in_progress", "resolved", "rejected"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const adminDepartmentId = Number(req.user.department_id);

    if (!Number.isFinite(adminDepartmentId)) {
      return res.status(400).json({ message: "Admin department not found" });
    }

    const [complaints] = await pool.execute(
      `SELECT complaint_id FROM complaint WHERE complaint_id = ? AND department_id = ?`,
      [complaintId, adminDepartmentId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const displayStatus = toDisplayStatus(status);
    const remarksText = remarks && remarks.trim() ? remarks.trim() : `Status changed to ${displayStatus}`;

    const [result] = await pool.execute(
      "INSERT INTO complaint_status (status, remarks, updated_by, complaint_id) VALUES (?, ?, ?, ?)",
      [displayStatus, remarksText, req.user.id, complaintId]
    );

    return res.json({ message: "Status updated", status, status_id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
}
