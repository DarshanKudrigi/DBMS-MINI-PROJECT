CREATE DATABASE IF NOT EXISTS complaint_db;
USE complaint_db;

DROP TABLE IF EXISTS complaint_status;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS department;

-- =========================
-- DEPARTMENT TABLE
-- =========================

CREATE TABLE department (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO department (dept_name) VALUES
('Computer Science'),
('Information Science'),
('Electronics and Communication'),
('Mechanical'),
('Civil'),
('Electrical and Electronics'),
('Artificial Intelligence and Machine Learning'),
('MBA'),
('MCA'),
('Others');

-- =========================
-- STUDENT TABLE
-- =========================

CREATE TABLE student (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- =========================
-- ADMIN TABLE
-- =========================

CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    department_id INT UNIQUE NULL,

    FOREIGN KEY (department_id)
        REFERENCES department(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

INSERT INTO admin
(name, email, password_hash, role, department_id)
VALUES
('Super Admin', 'superadmin@college.edu', 'superadmin123', 'super_admin', NULL);

-- =========================
-- COMPLAINT TABLE
-- =========================

CREATE TABLE complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    category ENUM(
        'Infrastructure',
        'Faculty',
        'Library',
        'Hostel',
        'Others'
    ) NOT NULL,

    issue_type VARCHAR(255),

    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    student_id VARCHAR(20) NOT NULL,
    department_id INT NOT NULL,
    handled_by INT NULL,

    FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (department_id)
        REFERENCES department(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (handled_by)
        REFERENCES admin(admin_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =========================
-- COMPLAINT STATUS TABLE
-- =========================

CREATE TABLE complaint_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,

    status ENUM(
        'Pending',
        'In Progress',
        'Resolved',
        'Rejected'
    ) NOT NULL,

    remarks VARCHAR(500),

    updated_by INT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    complaint_id INT NOT NULL,

    FOREIGN KEY (updated_by)
        REFERENCES admin(admin_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (complaint_id)
        REFERENCES complaint(complaint_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);