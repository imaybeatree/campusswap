import express from "express";
import path from "path";
import cors from "cors";
import { registerHandler, loginHandler } from "./auth/local/auth.handler.js";
import listingsRouter from "./routes/listings.js";
import usersRouter from "./routes/users.js";
import messagesRouter from "./routes/messages.js";
import uploadRouter from "./routes/upload.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/register", registerHandler);
app.post("/api/auth/login", loginHandler);

app.use("/api/upload", uploadRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

export default app;
