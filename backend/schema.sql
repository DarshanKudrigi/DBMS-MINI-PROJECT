CREATE DATABASE IF NOT EXISTS complaint_db;
USE complaint_db;

DROP TABLE IF EXISTS complaint_status;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS admin;

CREATE TABLE student (
  student_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  CONSTRAINT chk_student_usn
    CHECK (student_id REGEXP '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$')
);

CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  category ENUM('Infrastructure', 'Faculty', 'Library', 'Hostel', 'Others') NOT NULL UNIQUE
);

CREATE TABLE complaint (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Infrastructure', 'Faculty', 'Library', 'Hostel', 'Others') NOT NULL,
  issue_type VARCHAR(255),
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  student_id VARCHAR(20) NOT NULL,
  handled_by INT NULL,
  CONSTRAINT fk_complaint_student
    FOREIGN KEY (student_id) REFERENCES student(student_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_admin
    FOREIGN KEY (handled_by) REFERENCES admin(admin_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE complaint_status (
  status_id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') NOT NULL,
  remarks VARCHAR(500),
  updated_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  complaint_id INT NOT NULL,
  CONSTRAINT fk_status_admin
    FOREIGN KEY (updated_by) REFERENCES admin(admin_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_status_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE DEPARTMENT (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  DEPT_NAME VARCHAR(100) NOT NULL UNIQUE
); 
