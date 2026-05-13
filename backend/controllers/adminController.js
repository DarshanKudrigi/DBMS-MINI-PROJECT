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

function placeholders(values) {
  return values.map(() => "?").join(",");
}

async function getTagsByComplaintIds(complaintIds) {
  if (complaintIds.length === 0) {
    return new Map();
  }

  const [rows] = await pool.execute(
    `SELECT ct.complaint_id, t.tag_id, t.tag_name
    FROM complaint_tag ct
    JOIN tag t ON t.tag_id = ct.tag_id
    WHERE ct.complaint_id IN (${placeholders(complaintIds)})
    ORDER BY t.tag_name ASC`,
    complaintIds
  );

  const tagsByComplaint = new Map();

  rows.forEach((row) => {
    const tags = tagsByComplaint.get(row.complaint_id) || [];
    tags.push({ tag_id: row.tag_id, tag_name: row.tag_name });
    tagsByComplaint.set(row.complaint_id, tags);
  });

  return tagsByComplaint;
}

async function getLatestStatusByComplaintIds(complaintIds) {
  if (complaintIds.length === 0) {
    return new Map();
  }

  const [rows] = await pool.execute(
    `SELECT complaint_id, status
    FROM complaint_status
    WHERE complaint_id IN (${placeholders(complaintIds)})
    ORDER BY complaint_id ASC, status_id ASC`,
    complaintIds
  );

  const statusByComplaint = new Map();

  rows.forEach((row) => {
    statusByComplaint.set(row.complaint_id, row.status);
  });

  return statusByComplaint;
}

export async function getAllComplaints(req, res) {
  try {
    const isSuperAdmin = req.user.role === "super_admin";
    const adminDepartmentId = Number(req.user.department_id);

    if (!isSuperAdmin && !Number.isFinite(adminDepartmentId)) {
      return res.status(400).json({ message: "Admin department not found" });
    }

    const [rows] = await pool.execute(
      `SELECT
        c.complaint_id AS id,
        c.title,
        c.description,
        c.category,
        c.department_id,
        d.dept_name,
        c.issue_type,
        c.submitted_at AS created_at,
        s.student_id AS student_id,
        s.name AS student_name,
        s.email AS student_email,
        sp.semester,
        sp.section,
        a.name AS handled_by_name
      FROM complaint c
      JOIN student s ON c.student_id = s.student_id
      LEFT JOIN student_profile sp ON sp.student_id = s.student_id
      JOIN department d ON c.department_id = d.department_id
      LEFT JOIN admin a ON a.admin_id = c.handled_by
      ${isSuperAdmin ? "" : "WHERE c.department_id = ?"}
      ORDER BY c.complaint_id DESC`,
      isSuperAdmin ? [] : [adminDepartmentId]
    );
    const complaintIds = rows.map((row) => row.id);
    const tagsByComplaint = await getTagsByComplaintIds(complaintIds);
    const statusByComplaint = await getLatestStatusByComplaintIds(complaintIds);

    return res.json({
      data: rows.map((row) => ({
        ...row,
        tags: tagsByComplaint.get(row.id) || [],
        status: fromDatabaseStatus(statusByComplaint.get(row.id))
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
}

export async function getAdmins(req, res) {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }

  try {
    const [admins] = await pool.execute(
      `SELECT
        a.admin_id,
        a.name,
        a.email,
        a.role,
        a.department_id,
        d.dept_name
      FROM admin a
      LEFT JOIN department d ON a.department_id = d.department_id
      ORDER BY a.role DESC, d.dept_name ASC, a.name ASC`
    );
    const [counts] = await pool.execute(
      `SELECT department_id, COUNT(*) AS total_complaints
      FROM complaint
      GROUP BY department_id`
    );
    const countsByDepartment = new Map(
      counts.map((row) => [row.department_id, row.total_complaints])
    );

    return res.json({
      data: admins.map((admin) => ({
        ...admin,
        total_complaints: admin.department_id ? countsByDepartment.get(admin.department_id) || 0 : 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admins", error: error.message });
  }
}

export async function updateComplaintStatus(req, res) {
  const complaintId = Number(req.params.id);
  const { status, remarks } = req.body;
  const allowed = ["pending", "in_progress", "resolved", "rejected"];

  if (!Number.isInteger(complaintId)) {
    return res.status(400).json({ message: "Invalid complaint id" });
  }

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const isSuperAdmin = req.user.role === "super_admin";
    const adminDepartmentId = Number(req.user.department_id);

    if (!isSuperAdmin && !Number.isFinite(adminDepartmentId)) {
      return res.status(400).json({ message: "Admin department not found" });
    }

    const [complaints] = await pool.execute(
      `SELECT complaint_id FROM complaint WHERE complaint_id = ? ${
        isSuperAdmin ? "" : "AND department_id = ?"
      }`,
      isSuperAdmin ? [complaintId] : [complaintId, adminDepartmentId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const displayStatus = toDisplayStatus(status);
    const remarksText = remarks && remarks.trim() ? remarks.trim() : `Status changed to ${displayStatus}`;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE complaint SET handled_by = ? WHERE complaint_id = ?",
        [req.user.id, complaintId]
      );

      const [result] = await connection.execute(
        "INSERT INTO complaint_status (status, remarks, updated_by, complaint_id) VALUES (?, ?, ?, ?)",
        [displayStatus, remarksText, req.user.id, complaintId]
      );

      await connection.commit();

      return res.json({ message: "Status updated", status, status_id: result.insertId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
}
