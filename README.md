# DBMS-MINI PROJECT

Clean, minimal student complaint management system built with React (Vite), Node.js/Express and MySQL.

Key goals:

- Simple demonstration of a full-stack app with authentication and role-based admin features.
- Small codebase suitable for learning, extension, or quick prototyping.

Contents

- Features — What the project provides
- Tech stack — Libraries and tools used
- Quick start — How to run the app locally
- Backend & Frontend — specific instructions
- API overview — main endpoints
- Contributing, license, and contacts

Features

- User registration and login (JWT-based)
- Students can create and view complaints
- Admin dashboard to view and update complaint status
- Simple MySQL schema with seedable data

Tech stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL (mysql2)

Prerequisites

- Node.js 16+ and npm
- MySQL 5.7+ or compatible server

Quick start (development)

1. Clone the repository

```bash
git clone https://your-repo-url.git
cd DBMS-MINI
```

2. Install dependencies (project root runs helpers)

```bash
npm install
npm run install:all
```

Or install per-package:

```bash
npm --prefix frontend install
npm --prefix backend install
```

3. Configure environment variables

- Copy `backend/.env.example` → `backend/.env` and update database and JWT values
- Copy `frontend/.env.example` → `frontend/.env` to set API base URL if needed

4. Initialize the database

- Run the SQL in `backend/schema.sql` to create tables and any seed data

5. Start both servers (from repo root)

```bash
npm run dev
```

Default dev URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Backend (details)

- Schema: `backend/schema.sql` — run this in your MySQL instance before starting the server
- Config: database connections and environment variables are defined in `backend/config/db.js`
- Useful npm scripts (run from `backend` or via `npm --prefix backend run <script>`):
  - `start` — start server in production mode
  - `dev` — start server with nodemon

Environment variables (backend)

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL connection
- `PORT` — Backend port (default: 5000)
- `JWT_SECRET` — Secret for signing tokens
- `CLIENT_ORIGIN` — Frontend origin allowed by CORS

Frontend (details)

- Uses Vite for development and Tailwind CSS for styling
- Useful npm scripts (run from `frontend` or via `npm --prefix frontend run <script>`):
  - `dev` — start Vite dev server
  - `build` — build production bundle
  - `preview` — preview production build

API overview
Authentication

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — authenticate and receive a JWT

Complaints

- `GET /api/complaints` — list complaints for the authenticated student
- `POST /api/complaints` — submit a complaint (student)

Admin

- `GET /api/admin/complaints` — list all complaints (admin only)
- `PATCH /api/admin/complaints/:id/status` — update complaint status (admin only)

Project structure (top-level)

```
frontend/   # React app
backend/    # Express API + DB schema
```

Contributing

- Contributions are welcome — open an issue or submit a pull request with a clear description of changes.

License

- This repository is provided under the MIT License. Update the file `LICENSE` if you choose another license.

Contact

- For questions or help, open an issue in this repository.

---

If you'd like, I can also:

- add a sample `.env.example` files if missing
- add a `Makefile` or npm scripts to initialize the DB
- generate a short API reference markdown under `docs/`

Let me know which of the above you'd like next.
