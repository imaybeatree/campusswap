import express from "express";
import cors from "cors";
import listingsRouter from "./routes/listings.js";
import usersRouter from "./routes/users.js";
import messagesRouter from "./routes/messages.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/listings", listingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

export default app;
