import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import app from "./app.js";
import pool from "./db/index.js";

const PORT = Number(process.env["PORT"] ?? 3001);

console.log("[startup] ENV check:", {
  DB_HOST: process.env["DB_HOST"] ?? "NOT SET",
  DB_PORT: process.env["DB_PORT"] ?? "NOT SET",
  DB_USER: process.env["DB_USER"] ?? "NOT SET",
  DB_PASSWORD: process.env["DB_PASSWORD"] ? "***SET***" : "NOT SET",
  DB_NAME: process.env["DB_NAME"] ?? "NOT SET",
  JWT_SECRET: process.env["JWT_SECRET"] ? "***SET***" : "NOT SET",
  PORT,
});

async function start() {
  console.log("[startup] Connecting to database...");
  const connection = await pool.getConnection();
  console.log("[startup] Connected to MySQL database");
  connection.release();

  app.listen(PORT, () => {
    console.log(`[startup] Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("[startup] Failed to start server:", err);
  process.exit(1);
});
