import "./env.js";
import app from "./app.js";
import pool from "./db/index.js";

const PORT = Number(process.env["PORT"] ?? 3001);

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
