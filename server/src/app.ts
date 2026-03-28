import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { registerHandler, loginHandler } from "./auth/local/auth.handler.js";
import listingsRouter from "./routes/listings.js";
import usersRouter from "./routes/users.js";
import messagesRouter from "./routes/messages.js";
import uploadRouter from "./routes/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const app = express();

app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(ROOT, "client/dist")));
app.use("/uploads", express.static(path.join(ROOT, "server/uploads")));

// API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/register", registerHandler);
app.post("/api/auth/login", loginHandler);

app.use("/api/upload", uploadRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

// SPA fallback — after API routes
app.get("{*path}", (_req, res) => {
  res.sendFile(path.join(ROOT, "client/dist/index.html"));
});

export default app;
