# Student Complaint Management System

This is a DBMS mini project built with React, Express, and MySQL. The app lets students register, file complaints, add tags, and track status updates. Department admins can view complaints for their department and update the complaint status.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT

## Database From The Start

The database is named `complaint_db`. It stores students, admins, departments, complaints, complaint status history, student profiles, and complaint tags.

Run the schema from:

```bash
backend/schema.sql
```

The schema creates the database, drops old tables in dependency order, recreates the tables, and inserts seed rows for departments, tags, one super admin, and department admins.

## Main Tables

`department`

- Stores department names.
- Primary key: `department_id`.
- Used by students while filing complaints and by admins for department-wise access.

`student`

- Stores student login and contact data.
- Primary key: `student_id`.
- Unique field: `email`.

`student_profile`

- Stores extra student details.
- Primary key and foreign key: `student_id`.
- Demonstrates a `1:1` relationship with `student`.

`admin`

- Stores admin login data.
- Primary key: `admin_id`.
- `role` can be `admin` or `super_admin`.
- `department_id` is nullable because a super admin is not limited to one department.

`complaint`

- Stores the main complaint.
- Primary key: `complaint_id`.
- Foreign keys: `student_id`, `department_id`, `handled_by`.
- `handled_by` is nullable until an admin updates the complaint.

`complaint_status`

- Stores status history for each complaint.
- Primary key: `status_id`.
- Foreign keys: `complaint_id`, `updated_by`.
- Status values: `Pending`, `In Progress`, `Resolved`, `Rejected`.

`tag`

- Stores reusable complaint labels such as `Urgent`, `Safety`, and `Maintenance`.
- Primary key: `tag_id`.

`complaint_tag`

- Bridge table between `complaint` and `tag`.
- Composite primary key: `(complaint_id, tag_id)`.
- Demonstrates an `N:M` relationship.

## Relationship Types Covered

`1:N`

- `department -> complaint`: one department can have many complaints.
- `student -> complaint`: one student can file many complaints.
- `complaint -> complaint_status`: one complaint can have many status updates.

`N:M`

- `complaint <-> tag`: one complaint can have many tags, and one tag can belong to many complaints.
- Implemented using `complaint_tag`.

`1:1`

- `student -> student_profile`: every registered student gets one profile row.
- Both tables share `student_id`.

Total participation

- Every complaint must belong to a student.
- Every complaint must belong to a department.
- Every complaint status update must belong to a complaint and must be updated by an admin.

Partial participation

- A complaint may or may not have `handled_by`.
- A super admin may or may not have `department_id`.

## Normalization Notes

The schema is designed to avoid common anomalies.

First Normal Form

- Each column stores atomic values.
- Repeating tag values are not stored inside the complaint row.

Second Normal Form

- The bridge table `complaint_tag` uses a composite key.
- No non-key attributes depend on only part of that key.

Third Normal Form

- Department names are stored in `department`, not repeated in every complaint.
- Tag names are stored in `tag`, not repeated in every complaint.
- Status history is separated from complaint details.

Anomalies avoided

- Update anomaly: department name changes happen once in `department`.
- Insert anomaly: tags can be created before any complaint uses them.
- Delete anomaly: deleting a complaint does not delete the tag master data.

## Login Seed Data

Super admin:

```text
Email: superadmin@college.edu
Password: superadmin123
```

Department admins use password:

```text
admin123
```

Examples:

```text
csadmin@college.edu
isadmin@college.edu
ecadmin@college.edu
meadmin@college.edu
civiladmin@college.edu
eeadmin@college.edu
aimladmin@college.edu
mbaadmin@college.edu
mcaadmin@college.edu
generaladmin@college.edu
```

## How The Flow Works

Student registration:

1. Student enters USN, name, email, phone, semester, section, and password.
2. Backend validates the USN format.
3. A row is inserted into `student`.
4. A matching row is inserted into `student_profile` using the submitted semester and section.

Student complaint flow:

1. Student logs in.
2. Student selects category, department, issue type, tags, and description.
3. Backend inserts the complaint into `complaint`.
4. Selected tags are inserted into `complaint_tag`.
5. Student dashboard lists the complaint with latest status.

Admin status flow:

1. Admin logs in.
2. Normal admins see only complaints from their department.
3. Super admin sees complaints from all departments.
4. Admin opens a complaint and selects a new status.
5. Backend updates `complaint.handled_by`.
6. Backend inserts a new row into `complaint_status`.
7. The latest status is shown using the newest status history row.

## Important Simple Queries Used

The backend intentionally keeps SQL easy to explain. Instead of one large query with nested subqueries, it runs small queries and combines the result in JavaScript.

Student's complaints:

```sql
SELECT c.complaint_id, c.title, c.description, c.category, d.dept_name
FROM complaint c
JOIN department d ON c.department_id = d.department_id
WHERE c.student_id = ?;
```

Complaint status history:

```sql
SELECT status, remarks, updated_at
FROM complaint_status
WHERE complaint_id = ?
ORDER BY status_id ASC;
```

The latest status is the last row from this ordered result.

Tags for complaints:

```sql
SELECT ct.complaint_id, t.tag_name
FROM complaint_tag ct
JOIN tag t ON t.tag_id = ct.tag_id
WHERE ct.complaint_id IN (...);
```

Department admin's complaints:

```sql
SELECT *
FROM complaint
WHERE department_id = ?;
```

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login/student`
- `POST /api/auth/login/admin`
- `GET /api/auth/categories`

Student complaints:

- `GET /api/complaints`
- `POST /api/complaints`
- `POST /api/complaints/file`
- `GET /api/complaints/:id`
- `GET /api/complaints/departments`
- `GET /api/complaints/tags`

Admin:

- `GET /api/admin/complaints`
- `GET /api/admin/admins`
- `PATCH /api/admin/complaints/:id/status`

## Setup

Install dependencies:

```bash
npm install
npm run install:all
```

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=complaint_db
JWT_SECRET=your_secret_key
PORT=5000
```

Initialize database:

```bash
cd backend
npm run init-db
```

Run app:

```bash
cd ..
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Project Structure

```text
backend/
  config/db.js
  controllers/
  routes/
  middleware/
  schema.sql

frontend/
  src/components/
  src/pages/
  src/services/api.js
```

## Working Notes

- Passwords are stored as plain text because this is a DBMS mini project demo. For production, use hashing with `bcrypt`.
- Running `npm run init-db` recreates the database tables and deletes previous data.
- Department admins can resolve only complaints from their department.
- Super admin can resolve complaints from any department.
