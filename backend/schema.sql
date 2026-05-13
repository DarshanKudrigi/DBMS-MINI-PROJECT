CREATE DATABASE IF NOT EXISTS complaint_db;
USE complaint_db;

DROP TABLE IF EXISTS complaint_status;
DROP TABLE IF EXISTS complaint_tag;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS student_profile;
DROP TABLE IF EXISTS tag;
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
-- STUDENT PROFILE TABLE (1:1, total for students created by the app)
-- =========================

CREATE TABLE student_profile (
    student_id VARCHAR(20) PRIMARY KEY,
    semester TINYINT NOT NULL DEFAULT 1,
    section VARCHAR(10) NOT NULL DEFAULT 'A',

    FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
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
('Super Admin', 'superadmin@college.edu', 'superadmin123', 'super_admin', NULL),
('Computer Science Admin', 'csadmin@college.edu', 'admin123', 'admin', 1),
('Information Science Admin', 'isadmin@college.edu', 'admin123', 'admin', 2),
('Electronics Admin', 'ecadmin@college.edu', 'admin123', 'admin', 3),
('Mechanical Admin', 'meadmin@college.edu', 'admin123', 'admin', 4),
('Civil Admin', 'civiladmin@college.edu', 'admin123', 'admin', 5),
('Electrical Admin', 'eeadmin@college.edu', 'admin123', 'admin', 6),
('AIML Admin', 'aimladmin@college.edu', 'admin123', 'admin', 7),
('MBA Admin', 'mbaadmin@college.edu', 'admin123', 'admin', 8),
('MCA Admin', 'mcaadmin@college.edu', 'admin123', 'admin', 9),
('General Admin', 'generaladmin@college.edu', 'admin123', 'admin', 10);

-- =========================
-- TAG TABLE
-- =========================

CREATE TABLE tag (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO tag (tag_name) VALUES
('Urgent'),
('Safety'),
('Academic'),
('Maintenance'),
('Student Welfare'),
('Facilities'),
('Hostel'),
('Digital Services');

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
-- COMPLAINT TAG TABLE (N:M)
-- =========================

CREATE TABLE complaint_tag (
    complaint_id INT NOT NULL,
    tag_id INT NOT NULL,

    PRIMARY KEY (complaint_id, tag_id),

    FOREIGN KEY (complaint_id)
        REFERENCES complaint(complaint_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id)
        REFERENCES tag(tag_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
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
