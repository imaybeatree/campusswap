import type { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { jwtSecret } from "./secret.js";
import z from "zod/v4";

const authHeaderSchema = z.string().transform((val) => {
  const match = val.match(/^Bearer\s+(\S+)$/);
  if (!match?.[1]) throw new Error("Invalid Authorization header");
  return match[1];
});

const jwtPayloadSchema = z.object({
  sub: z.string(),
});

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const token = authHeaderSchema.parse(req.headers.authorization);
    const { payload } = await jwtVerify(token, jwtSecret, {
      issuer: "campusswap",
      audience: "campusswap",
    });
    const { sub } = jwtPayloadSchema.parse(payload);
    res.locals["user"] = { userId: Number(sub) };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};
