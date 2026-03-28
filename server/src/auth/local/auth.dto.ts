import z from "zod/v4";

export const registerRequestSchema = z.object({
  email: z.string().email().refine((e) => e.endsWith("@lehigh.edu"), {
    message: "Only @lehigh.edu emails are allowed",
  }),
  username: z.string().min(1).max(100),
  password: z.string().min(8).max(72),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authTokenResponseSchema = z.object({
  token: z.string(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
