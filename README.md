# DBMS Mini Project

Simple complaint management system using React (Vite), Node.js/Express, and MySQL/mysql12.

## Project Overview

Students can register, log in, and submit complaints. Admins can view complaints for their department and update status.

## Features

- Student registration and login (JWT auth)
- Complaint creation and complaint history for students
- Admin dashboard with complaint status updates
- Department-based complaint handling

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, mysql2, bcryptjs, jsonwebtoken
- Database: MySQL

## Setup

### 1) Install dependencies

From project root:

```bash
npm install
npm run install:all
```

### 2) Environment variables

Backend:

```bash
copy backend\\.env.example backend\\.env
```

Frontend:

```bash
copy frontend\\.env.example frontend\\.env.local
```

## MySQL Database Setup

- Database: `complaint_db_arun_master`
- Run schema file:

```bash
mysql -u root -p < backend/schema.sql
```

Or use backend script:

```bash
npm --prefix backend run init-db
```

## Run Commands

Run frontend + backend together (root):

```bash
npm run dev
```

Run separately:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## Environment Variables

Backend (`backend/.env`):

- `PORT`
- `CLIENT_ORIGIN`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (set to `complaint_db_arun_master`)
- `JWT_SECRET`

Frontend (`frontend/.env.local`):

- `VITE_API_URL` (example: `http://localhost:8000/api`)

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  routes/
  schema.sql
  server.js
frontend/
  src/
  index.html
```
