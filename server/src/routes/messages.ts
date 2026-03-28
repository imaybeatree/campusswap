import { Router } from "express";
import pool from "../db/index.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET /api/messages/:userId - get all conversations for a user
router.get("/:userId", async (req, res) => {
  const userId = req.params["userId"];
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT m.*, u.username as sender_name, l.title as listing_title
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     JOIN listings l ON m.listing_id = l.id
     WHERE m.sender_id = ? OR m.receiver_id = ?
     ORDER BY m.created_at DESC`,
    [userId, userId]
  );
  res.json(rows);
});

// POST /api/messages - send a message
router.post("/", async (req, res) => {
  const { sender_id, receiver_id, listing_id, content } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO messages (sender_id, receiver_id, listing_id, content) VALUES (?, ?, ?, ?)",
    [sender_id, receiver_id, listing_id, content]
  );
  res.status(201).json({ id: result.insertId });
});

export default router;
