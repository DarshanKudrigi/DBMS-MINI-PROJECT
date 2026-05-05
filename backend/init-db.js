import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

async function initializeDatabase() {
  let connection;
  try {
    console.log("🔄 Initializing database...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("📝 Executing schema.sql...");
    await connection.query(schema);


    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

initializeDatabase();
