export const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your_jwt_secret_here",
);
