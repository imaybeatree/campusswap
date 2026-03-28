import axios from "axios";
import { getToken } from "./token";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

export const http = () =>
  axios.create({
    baseURL: BACKEND_URL,
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
  });

export const imageUrl = (path: string | null): string | null =>
  path ? `${BACKEND_URL}${path}` : null;