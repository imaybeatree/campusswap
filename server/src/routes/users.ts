import { Router } from "express";
import pool from "../db/index.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET /api/users/:id - get user profile
router.get("/:id", async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email, username, created_at FROM users WHERE id = ?",
    [req.params["id"]]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(rows[0]);
});

// GET /api/users/:id/listings - get user's listings
router.get("/:id/listings", async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, user_id, title, description, price, category, condition_type, status, image_url, created_at, updated_at FROM listings WHERE user_id = ? ORDER BY created_at DESC",
    [req.params["id"]]
  );
  res.json(rows);
});

// POST /api/users - create user (register)
router.post("/", async (req, res) => {
  const { email, username, password_hash } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
    [email, username, password_hash]
  );
  res.status(201).json({ id: result.insertId });
});

// PUT /api/users/:id - update user profile
router.put("/:id", async (req, res) => {
  const { username } = req.body;
  await pool.query(
    "UPDATE users SET username = ? WHERE id = ?",
    [username, req.params["id"]]
  );
  res.json({ message: "User updated" });
});

export default router;
