import { Router } from "express";
import pool from "../db/index.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { authMiddleware } from "../auth/middleware.js";

const router = Router();

router.use(authMiddleware);

// GET /api/messages/conversations - list conversations grouped by listing + other user
router.get("/conversations", async (_req, res) => {
  const userId = res.locals["user"].userId;

  // For each unique (listing, other_user) pair, get the latest message
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       c.listing_id,
       c.other_user_id,
       l.title AS listing_title,
       l.image_url AS listing_image_url,
       u.username AS other_username,
       m.id AS last_message_id,
       m.content AS last_message,
       m.sender_id AS last_sender_id,
       m.created_at AS last_message_at,
       (
         SELECT COUNT(*) FROM messages m2
         WHERE m2.listing_id = c.listing_id
           AND m2.sender_id = c.other_user_id
           AND m2.receiver_id = ?
           AND m2.is_read = FALSE
       ) AS unread_count
     FROM (
       SELECT
         listing_id,
         CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
         MAX(id) AS last_message_id
       FROM messages
       WHERE sender_id = ? OR receiver_id = ?
       GROUP BY listing_id, other_user_id
     ) c
     JOIN messages m ON m.id = c.last_message_id
     JOIN users u ON u.id = c.other_user_id
     JOIN listings l ON l.id = c.listing_id
     ORDER BY m.created_at DESC`,
    [userId, userId, userId, userId]
  );

  res.json(rows);
});

// GET /api/messages/thread/:listingId/:otherUserId - get message thread
router.get("/thread/:listingId/:otherUserId", async (req, res) => {
  const userId = res.locals["user"].userId;
  const listingId = Number(req.params["listingId"]);
  const otherUserId = Number(req.params["otherUserId"]);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT m.id, m.sender_id, m.receiver_id, m.listing_id, m.content, m.is_read, m.created_at,
            u.username AS sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.listing_id = ?
       AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
     ORDER BY m.created_at ASC`,
    [listingId, userId, otherUserId, otherUserId, userId]
  );

  // Mark messages from other user as read
  await pool.query(
    `UPDATE messages SET is_read = TRUE
     WHERE listing_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = FALSE`,
    [listingId, otherUserId, userId]
  );

  res.json(rows);
});

// POST /api/messages - send a message
router.post("/", async (req, res) => {
  const senderId = res.locals["user"].userId;
  const { receiver_id, listing_id, content } = req.body;

  if (!receiver_id || !listing_id || !content?.trim()) {
    res.status(400).json({ error: "receiver_id, listing_id, and content are required" });
    return;
  }

  if (Number(receiver_id) === senderId) {
    res.status(400).json({ error: "Cannot message yourself" });
    return;
  }

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO messages (sender_id, receiver_id, listing_id, content) VALUES (?, ?, ?, ?)",
    [senderId, receiver_id, listing_id, content.trim()]
  );

  res.status(201).json({ id: result.insertId });
});

// GET /api/messages/unread-count - total unread messages for badge
router.get("/unread-count", async (_req, res) => {
  const userId = res.locals["user"].userId;
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = FALSE",
    [userId]
  );
  res.json({ count: rows[0]!.count });
});

export default router;
