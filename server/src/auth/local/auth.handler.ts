import type { RequestHandler } from "express";
import { issueJwt } from "./jwt.js";
import { hashPassword, verifyPassword } from "./password.js";
import { insertUser, getUserByEmail, getUserByUsername } from "./user.entity.js";
import {
  authTokenResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
} from "./auth.dto.js";
import z from "zod/v4";

export const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { email, username, password } = registerRequestSchema.parse(req.body);

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      res.status(409).json({ error: "email_taken" });
      return;
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      res.status(409).json({ error: "username_taken" });
      return;
    }

    const password_hash = await hashPassword(password);
    const newUser = await insertUser({ email, username, password_hash });

    const token = await issueJwt(newUser.id);
    res.status(201).json(authTokenResponseSchema.parse({ token }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data" });
      return;
    }
    console.error("Register failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = loginRequestSchema.parse(req.body);
    console.log(`${email}, ${password}`)

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const ok = await verifyPassword(user.password_hash, password);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = await issueJwt(user.id);
    res.json(authTokenResponseSchema.parse({ token }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data" });
      return;
    }
    console.error("Login failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
