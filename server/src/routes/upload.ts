import { Router } from "express";
import multer from "multer";
import pool from "../db/index.js";
import type { RowDataPacket } from "mysql2";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

// Upload image and attach to a listing
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const listingId = req.body.listing_id;
  if (!listingId) {
    res.status(400).json({ error: "listing_id is required" });
    return;
  }
  await pool.query(
    "UPDATE listings SET image_data = ?, image_mime = ?, image_url = ? WHERE id = ?",
    [req.file.buffer, req.file.mimetype, `/api/listings/${listingId}/image`, listingId],
  );
  res.status(201).json({ url: `/api/listings/${listingId}/image` });
});

// Serve image from DB
router.get("/listings/:id/image", async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT image_data, image_mime FROM listings WHERE id = ?",
    [req.params["id"]],
  );
  if (rows.length === 0 || !rows[0]!.image_data) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  const { image_data, image_mime } = rows[0]!;
  res.set("Content-Type", image_mime);
  res.set("Cache-Control", "public, max-age=86400");
  res.send(image_data);
});

export default router;
