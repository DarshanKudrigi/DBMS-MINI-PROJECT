import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function ensureDatabaseExists() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_NAME) {
    throw new Error("DB_NAME is not configured");
  }

  const connection = await mysql.createConnection({
    host: DB_HOST || "localhost",
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  } finally {
    await connection.end();
  }
}

async function migrateAuthColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [studentColumns] = await connection.query("SHOW COLUMNS FROM student LIKE 'password'");
    if (studentColumns.length > 0) {
      await connection.query("ALTER TABLE student CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL");
    }

    const [adminColumns] = await connection.query("SHOW COLUMNS FROM admin LIKE 'password'");
    if (adminColumns.length > 0) {
      await connection.query("ALTER TABLE admin CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL");
    }
  } finally {
    await connection.end();
  }
}

async function removeHandledByColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [foreignKeys] = await connection.query(
      `SELECT CONSTRAINT_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'complaint'
         AND COLUMN_NAME = 'handled_by'
         AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [process.env.DB_NAME]
    );

    for (const row of foreignKeys) {
      await connection.query(`ALTER TABLE complaint DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
    }

    const [columns] = await connection.query("SHOW COLUMNS FROM complaint LIKE 'handled_by'");
    if (columns.length > 0) {
      await connection.query("ALTER TABLE complaint DROP COLUMN handled_by");
    }
  } finally {
    await connection.end();
  }
}

await ensureDatabaseExists();
await migrateAuthColumns();
await removeHandledByColumn();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testDbConnection() {
  await pool.query("SELECT 1");
}

export default pool;
