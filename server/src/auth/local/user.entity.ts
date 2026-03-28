import pool from "../../db/index.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface UserRow {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export const getUserByEmail = async (
  email: string,
): Promise<UserRow | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email],
  );
  if (rows.length === 0) return null;
  return rows[0] as UserRow;
};

export const getUserByUsername = async (
  username: string,
): Promise<UserRow | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE username = ?",
    [username],
  );
  if (rows.length === 0) return null;
  return rows[0] as UserRow;
};

export const insertUser = async (params: {
  email: string;
  username: string;
  password_hash: string;
}): Promise<UserRow> => {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
    [params.email, params.username, params.password_hash],
  );
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE id = ?",
    [result.insertId],
  );
  return rows[0] as UserRow;
};
