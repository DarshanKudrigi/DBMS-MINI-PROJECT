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

function toDisplayStatus(status) {
  const normalized = normalizeStatus(status);

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

export async function createComplaint(req, res) {
  const { title, description, department_id: departmentId, issue_type: issueType } = req.body;
  const studentId = String(req.user.id);
  const parsedDepartmentId = Number(departmentId);

  if (!title || !description || !Number.isInteger(parsedDepartmentId)) {
    return res.status(400).json({ message: "title, description, and department are required" });
  }

  try {
    const [students] = await pool.execute("SELECT student_id FROM student WHERE student_id = ?", [studentId]);

    if (students.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [departments] = await pool.execute(
      "SELECT department_id, dept_name FROM department WHERE department_id = ?",
      [parsedDepartmentId]
    );

    if (departments.length === 0) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const [result] = await pool.execute(
      "INSERT INTO complaint (title, description, issue_type, student_id, department_id) VALUES (?, ?, ?, ?, ?)",
      [title, description, issueType || null, studentId, parsedDepartmentId]
    );

    return res.status(201).json({
      message: "Complaint submitted",
      complaint: {
        id: result.insertId,
        student_id: studentId,
        title,
        description,
        department_id: parsedDepartmentId,
        dept_name: departments[0].dept_name,
        issue_type: issueType || null,
        status: "pending"
      }
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
        c.department_id,
        d.dept_name,
        c.issue_type,
        COALESCE(
          LOWER(REPLACE(cs.status, ' ', '_')),
          'pending'
        ) AS status,
        c.submitted_at AS created_at
      FROM complaint c
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
      WHERE c.student_id = ?
      ORDER BY c.complaint_id DESC`,
      [studentId]
    );

    return res.json({
      data: rows.map((row) => ({
        ...row,
        status: normalizeStatus(row.status),
        latest_status_label: toDisplayStatus(row.status)
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
}

export async function getComplaintDetails(req, res) {
  const complaintId = Number(req.params.id);
  const userId = String(req.user.id);
  const userRole = req.user.role;
  const adminDepartmentId = Number(req.user.department_id);

  if (!Number.isFinite(complaintId)) {
    return res.status(400).json({ message: "Invalid complaint id" });
  }

  try {
    let query;
    let params;

    if (userRole === "admin") {
      if (!Number.isFinite(adminDepartmentId)) {
        return res.status(400).json({ message: "Admin department not found" });
      }

      query = `SELECT
        c.complaint_id AS id,
        c.student_id,
        c.title,
        c.description,
        c.department_id,
        d.dept_name,
        c.issue_type,
        c.submitted_at AS created_at,
        s.name AS student_name,
        s.email AS student_email,
        s.phone AS student_phone,
        COALESCE(
          LOWER(REPLACE(cs.status, ' ', '_')),
          'pending'
        ) AS status
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
      WHERE c.complaint_id = ? AND c.department_id = ?`;
      params = [complaintId, adminDepartmentId];
    } else {
      query = `SELECT
        c.complaint_id AS id,
        c.student_id,
        c.title,
        c.description,
        c.department_id,
        d.dept_name,
        c.issue_type,
        c.submitted_at AS created_at,
        COALESCE(
          LOWER(REPLACE(cs.status, ' ', '_')),
          'pending'
        ) AS status
      FROM complaint c
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
      WHERE c.complaint_id = ? AND c.student_id = ?`;
      params = [complaintId, userId];
    }

    const [complaints] = await pool.execute(query, params);

    if (complaints.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const [historyRows] = await pool.execute(
      `SELECT
        cs.status,
        cs.remarks,
        cs.updated_at,
        a.name AS updated_by_name
      FROM complaint_status cs
      JOIN admin a ON cs.updated_by = a.admin_id
      WHERE cs.complaint_id = ?
      ORDER BY cs.updated_at ASC, cs.status_id ASC`,
      [complaintId]
    );

    const complaint = complaints[0];

    return res.json({
      data: {
        ...complaint,
        status: normalizeStatus(complaint.status),
        latest_status_label: toDisplayStatus(complaint.status),
        status_history: historyRows.map((row) => ({
          ...row,
          status: toDisplayStatus(row.status)
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaint details", error: error.message });
  }
}

export async function getDepartments(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT department_id, dept_name FROM department ORDER BY dept_name ASC"
    );

    return res.json({ data: rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch departments", error: error.message });
  }
}
