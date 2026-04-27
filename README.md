# Full-Stack Starter: React + Express + MySQL

## Stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL using `mysql2`

## Project Structure

```
DBMS-MINI/
  frontend/
  backend/
```

## 1) Install Dependencies

From the project root:

```bash
npm install
npm run install:all
```

Or install individually:

```bash
npm --prefix frontend install
npm --prefix backend install
```

## 2) Configure Environment Variables

1. Copy `frontend/.env.example` to `frontend/.env`
2. Copy `backend/.env.example` to `backend/.env`
3. Update values as needed.

## 3) Setup MySQL

Run `backend/schema.sql` in your MySQL instance.

## 4) Start Development Servers

From root:

```bash
npm run dev
```

This runs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/complaints` (student)
- `POST /api/complaints` (student)
- `GET /api/admin/complaints` (admin)
- `PATCH /api/admin/complaints/:id/status` (admin)

## Notes

- Frontend API base URL is `http://localhost:5000/api`.
- Backend uses `dotenv` and CORS origin from `CLIENT_ORIGIN`.
