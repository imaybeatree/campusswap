import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import app from "./app.js";
import pool from "./db/index.js";

const PORT = Number(process.env["PORT"] ?? 3001);

async function start() {
  // verify db connection
  const connection = await pool.getConnection();
  console.log("Connected to MySQL database");
  connection.release();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
