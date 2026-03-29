import { Router } from "express";
import pool from "../db/index.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET /api/listings - get all active listings
router.get("/", async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT l.id, l.user_id, l.title, l.description, l.price, l.category, l.condition_type, l.status, l.image_url, l.created_at, l.updated_at, u.username
     FROM listings l
     JOIN users u ON l.user_id = u.id
     WHERE l.status != 'sold'
     ORDER BY l.created_at DESC`
  );
  res.json(rows);
});

// GET /api/listings/search?q=&category=&minPrice=&maxPrice=
router.get("/search", async (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query;
  let sql = `SELECT l.id, l.user_id, l.title, l.description, l.price, l.category, l.condition_type, l.status, l.image_url, l.created_at, l.updated_at, u.username FROM listings l JOIN users u ON l.user_id = u.id WHERE l.status != 'sold'`;
  const params: (string | number)[] = [];

  if (q) {
    sql += ` AND (l.title LIKE ? OR l.description LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += ` AND l.category = ?`;
    params.push(category as string);
  }
  if (minPrice) {
    sql += ` AND l.price >= ?`;
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    sql += ` AND l.price <= ?`;
    params.push(Number(maxPrice));
  }

  sql += ` ORDER BY l.created_at DESC`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  res.json(rows);
});

// GET /api/listings/:id - get single listing
router.get("/:id", async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT l.id, l.user_id, l.title, l.description, l.price, l.category, l.condition_type, l.status, l.image_url, l.created_at, l.updated_at, u.username
     FROM listings l
     JOIN users u ON l.user_id = u.id
     WHERE l.id = ?`,
    [req.params["id"]]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(rows[0]);
});

// POST /api/listings - create listing
router.post("/", async (req, res) => {
  const { user_id, title, description, price, category, condition_type, image_url } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO listings (user_id, title, description, price, category, condition_type, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, title, description, price, category, condition_type, image_url]
  );
  res.status(201).json({ id: result.insertId });
});

// PUT /api/listings/:id - update listing
router.put("/:id", async (req, res) => {
  const { title, description, price, category, condition_type, status, image_url } = req.body;
  await pool.query(
    `UPDATE listings SET title = ?, description = ?, price = ?, category = ?, condition_type = ?, status = ?, image_url = ?
     WHERE id = ?`,
    [title, description, price, category, condition_type, status, image_url, req.params["id"]]
  );
  res.json({ message: "Listing updated" });
});

// DELETE /api/listings/:id - delete listing
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM listings WHERE id = ?", [req.params["id"]]);
  res.json({ message: "Listing deleted" });
});

export default router;
