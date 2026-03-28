import { SignJWT } from "jose";
import { jwtSecret } from "../secret.js";

export const issueJwt = async (userId: number): Promise<string> => {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("campusswap")
    .setAudience("campusswap")
    .setSubject(userId.toString())
    .setExpirationTime("2h")
    .sign(jwtSecret);
};
