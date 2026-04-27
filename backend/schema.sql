CREATE DATABASE IF NOT EXISTS complaint_db;
USE complaint_db;

DROP TABLE IF EXISTS complaint_status;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS department;

CREATE TABLE department (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  dept_id INT NOT NULL UNIQUE,
  CONSTRAINT fk_admin_department
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE student (
  student_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  dept_id INT NOT NULL,
  CONSTRAINT chk_student_usn
    CHECK (student_id REGEXP '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$'),
  CONSTRAINT fk_student_department
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE complaint (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Infrastructure', 'Faculty', 'Library', 'Hostel', 'Others') NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  student_id VARCHAR(20) NOT NULL,
  dept_id INT NOT NULL,
  handled_by INT NULL,
  CONSTRAINT fk_complaint_student
    FOREIGN KEY (student_id) REFERENCES student(student_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_department
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
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

INSERT INTO department (dept_name) VALUES
  ('Computer Science'),
  ('Mechanical Engineering');

INSERT INTO admin (name, email, password_hash, dept_id) VALUES
  ('Aarav Sharma', 'aarav.admin@college.edu', 'admin123', 1),
  ('Neha Verma', 'neha.admin@college.edu', 'admin123', 2);

INSERT INTO student (student_id, name, email, phone, password_hash, dept_id) VALUES
  ('4NI24IS040', 'Riya Patel', 'riya.patel@college.edu', '9876543210', 'student123', 1),
  ('4NI23CS123', 'Karan Singh', 'karan.singh@college.edu', '9876543211', 'student123', 1),
  ('4NI24ME015', 'Meera Nair', 'meera.nair@college.edu', '9876543212', 'student123', 2);

INSERT INTO complaint (title, description, category, submitted_at, student_id, dept_id, handled_by) VALUES
  ('Broken Projector in Lab 3', 'Projector is not turning on during class.', 'Infrastructure', '2026-04-20 09:15:00', '4NI24IS040', 1, 1),
  ('Irregular Faculty Attendance', 'Faculty missed two lectures this week without notice.', 'Faculty', '2026-04-20 11:00:00', '4NI23CS123', 1, 1),
  ('Library Wi-Fi Slow', 'Wi-Fi speed in reading hall is extremely slow.', 'Library', '2026-04-21 14:30:00', '4NI24IS040', 1, 1),
  ('Hostel Water Supply Issue', 'No water on second floor since morning.', 'Hostel', '2026-04-22 07:50:00', '4NI24ME015', 2, 2),
  ('Other Campus Cleanliness Concern', 'Waste bins near canteen are not cleared regularly.', 'Others', '2026-04-23 16:10:00', '4NI24ME015', 2, 2);

INSERT INTO complaint_status (status, remarks, updated_by, updated_at, complaint_id) VALUES
  ('Pending', 'Complaint received and queued.', 1, '2026-04-20 09:20:00', 1),
  ('In Progress', 'Technician assigned to inspect projector.', 1, '2026-04-20 12:00:00', 1),
  ('Resolved', 'Projector lamp replaced and tested.', 1, '2026-04-21 10:30:00', 1),

  ('Pending', 'Complaint logged for review.', 1, '2026-04-20 11:05:00', 2),
  ('Rejected', 'Attendance records do not support the claim.', 1, '2026-04-21 09:45:00', 2),

  ('Pending', 'Issue recorded.', 1, '2026-04-21 14:35:00', 3),
  ('In Progress', 'Network team reviewing access point load.', 1, '2026-04-22 10:00:00', 3),

  ('Pending', 'Hostel complaint registered.', 2, '2026-04-22 08:00:00', 4),
  ('Resolved', 'Water pump restarted and pressure restored.', 2, '2026-04-22 11:20:00', 4),

  ('Pending', 'Forwarded to maintenance staff.', 2, '2026-04-23 16:20:00', 5),
  ('In Progress', 'Daily cleaning roster updated.', 2, '2026-04-24 09:00:00', 5);
