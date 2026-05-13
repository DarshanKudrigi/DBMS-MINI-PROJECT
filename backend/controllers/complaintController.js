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

function normalizeTagIds(tagIds) {
  if (!Array.isArray(tagIds)) {
    return [];
  }

  return [...new Set(tagIds.map((tagId) => Number(tagId)).filter((tagId) => Number.isInteger(tagId)))];
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

export async function createComplaint(req, res) {
  const { title, description, category, department_id: departmentId, issue_type: issueType, tag_ids: rawTagIds } = req.body;
  const studentId = String(req.user.id);
  const parsedDepartmentId = Number(departmentId);
  const tagIds = normalizeTagIds(rawTagIds);

  if (!title || !description || !category || !Number.isInteger(parsedDepartmentId)) {
    return res.status(400).json({ message: "title, description, category, and department are required" });
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

    let tags = [];

    if (tagIds.length > 0) {
      const placeholders = tagIds.map(() => "?").join(",");
      const [tagRows] = await pool.execute(
        `SELECT tag_id, tag_name FROM tag WHERE tag_id IN (${placeholders}) ORDER BY tag_name ASC`,
        tagIds
      );

      if (tagRows.length !== tagIds.length) {
        return res.status(400).json({ message: "Invalid complaint tag selected" });
      }

      tags = tagRows;
    }

    const connection = await pool.getConnection();
    let result;

    try {
      await connection.beginTransaction();

      [result] = await connection.execute(
        "INSERT INTO complaint (title, description, category, issue_type, student_id, department_id, handled_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, description, category, issueType || null, studentId, parsedDepartmentId, null]
      );

      if (tagIds.length > 0) {
        const values = tagIds.map((tagId) => [result.insertId, tagId]);
        await connection.query("INSERT INTO complaint_tag (complaint_id, tag_id) VALUES ?", [values]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return res.status(201).json({
      message: "Complaint submitted",
      complaint: {
        id: result.insertId,
        student_id: studentId,
        title,
        description,
        category,
        department_id: parsedDepartmentId,
        dept_name: departments[0].dept_name,
        issue_type: issueType || null,
        tags,
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
        c.category,
        c.department_id,
        d.dept_name,
        c.issue_type,
        c.submitted_at AS created_at
      FROM complaint c
      JOIN department d ON c.department_id = d.department_id
      WHERE c.student_id = ?
      ORDER BY c.complaint_id DESC`,
      [studentId]
    );
    const complaintIds = rows.map((row) => row.id);
    const tagsByComplaint = await getTagsByComplaintIds(complaintIds);
    const statusByComplaint = await getLatestStatusByComplaintIds(complaintIds);

    return res.json({
      data: rows.map((row) => ({
        ...row,
        tags: tagsByComplaint.get(row.id) || [],
        status: normalizeStatus(statusByComplaint.get(row.id)),
        latest_status_label: toDisplayStatus(statusByComplaint.get(row.id))
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
  const isSuperAdmin = userRole === "super_admin";
  const adminDepartmentId = Number(req.user.department_id);

  if (!Number.isFinite(complaintId)) {
    return res.status(400).json({ message: "Invalid complaint id" });
  }

  try {
    let query;
    let params;

    if (userRole === "admin" || isSuperAdmin) {
      if (!isSuperAdmin && !Number.isFinite(adminDepartmentId)) {
        return res.status(400).json({ message: "Admin department not found" });
      }

      query = `SELECT
        c.complaint_id AS id,
        c.student_id,
        c.title,
        c.description,
        c.category,
        c.department_id,
        d.dept_name,
        c.issue_type,
        c.submitted_at AS created_at,
        s.name AS student_name,
        s.email AS student_email,
        s.phone AS student_phone,
        sp.semester,
        sp.section
      FROM complaint c
      JOIN student s ON c.student_id = s.student_id
      LEFT JOIN student_profile sp ON sp.student_id = s.student_id
      JOIN department d ON c.department_id = d.department_id
      WHERE c.complaint_id = ? ${isSuperAdmin ? "" : "AND c.department_id = ?"}`;
      params = isSuperAdmin ? [complaintId] : [complaintId, adminDepartmentId];
    } else {
      // Student can only view their own complaints
      query = `SELECT
        c.complaint_id AS id,
        c.student_id,
        c.title,
        c.description,
        c.category,
        c.department_id,
        d.dept_name,
        c.issue_type,
        c.submitted_at AS created_at
      FROM complaint c
      JOIN department d ON c.department_id = d.department_id
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
    const [tagsByComplaint] = await Promise.all([getTagsByComplaintIds([complaintId])]);
    const latestStatus = historyRows.length > 0 ? historyRows[historyRows.length - 1].status : "Pending";

    return res.json({
      data: {
        ...complaint,
        tags: tagsByComplaint.get(complaintId) || [],
        status: normalizeStatus(latestStatus),
        latest_status_label: toDisplayStatus(latestStatus),
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

export async function getTags(req, res) {
  try {
    const [rows] = await pool.execute("SELECT tag_id, tag_name FROM tag ORDER BY tag_name ASC");

    return res.json({ data: rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tags", error: error.message });
  }
}
