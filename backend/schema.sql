CREATE DATABASE IF NOT EXISTS complaint_db_arun_master;
USE complaint_db_arun_master;

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
('Infrastructure'),
('Faculty'),
('Library'),
('Hostel'),
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
    department_id INT NOT NULL UNIQUE,

    FOREIGN KEY (department_id)
        REFERENCES department(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

INSERT INTO admin
(name, email, password_hash, department_id)
VALUES
('Infrastructure Admin', 'infrastructure@college.edu', 'password123', 1),
('Faculty Admin', 'faculty@college.edu', 'password123', 2),
('Library Admin', 'library@college.edu', 'password123', 3),
('Hostel Admin', 'hostel@college.edu', 'password123', 4),
('Others Admin', 'others@college.edu', 'password123', 5);

-- =========================
-- COMPLAINT TABLE
-- =========================

CREATE TABLE complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    issue_type VARCHAR(255),

    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    student_id VARCHAR(20) NOT NULL,
    department_id INT NOT NULL,

    FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (department_id)
        REFERENCES department(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
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