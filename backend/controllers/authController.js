import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { COMPLAINT_CATEGORIES } from "../constants/categories.js";

const STUDENT_USN_REGEX = /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/;

function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function registerStudent(req, res) {
  try {
    const { student_id: rawStudentId, name, email, phone, password } = req.body;
    const studentId = String(rawStudentId || "").trim().toUpperCase();

    if (!studentId || !name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "student_id, name, email, phone, and password are required" });
    }

    if (!STUDENT_USN_REGEX.test(studentId)) {
      return res.status(400).json({
        message: "student_id must match USN format like 4NI24IS040"
      });
    }

    const [existing] = await pool.execute(
      "SELECT student_id FROM student WHERE email = ? OR student_id = ?",
      [email, studentId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Student already registered with this email or student_id" });
    }

    const [result] = await pool.execute(
      "INSERT INTO student (student_id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
      [studentId, name, email, phone, password]
    );

    return res.status(201).json({
      message: "Student registration successful",
      student: {
        id: studentId,
        name,
        email,
        phone
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register student" });
  }
}

export async function loginStudent(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const [students] = await pool.execute(
      "SELECT student_id, name, email, password_hash FROM student WHERE email = ?",
      [email]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "Student user not found" });
    }

    const student = students[0];
    const isPasswordValid = password === student.password_hash;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = signToken({ id: student.student_id, role: "student", name: student.name });

    return res.status(200).json({
      message: "Student login successful",
      token,
      user: {
        id: student.student_id,
        role: "student",
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    if (error.message === "JWT secret is not configured") {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    return res.status(500).json({ message: "Failed to login student" });
  }
}

export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const [admins] = await pool.execute(
      "SELECT admin_id, name, email, password_hash FROM admin WHERE email = ?",
      [email]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const admin = admins[0];
    const isPasswordValid = password === admin.password_hash;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = signToken({ id: admin.admin_id, role: "admin", name: admin.name });

    return res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.admin_id,
        role: "admin",
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    if (error.message === "JWT secret is not configured") {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    return res.status(500).json({ message: "Failed to login admin" });
  }
}

export async function getCategories(req, res) {
  try {
    return res.status(200).json({ data: COMPLAINT_CATEGORIES });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
}
