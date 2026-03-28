import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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
